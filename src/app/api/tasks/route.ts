import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseConnection'

// GET all tasks for a user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const goalId = searchParams.get('goalId')
    const date = searchParams.get('date')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('tasks')
      .select(`
        *,
        goal:goals!inner(*)
      `)
      .eq('user_id', userId)
      .order('date', { ascending: true })
      .order('time', { ascending: true })
      .order('created_at', { ascending: false })

    if (goalId) {
      query = query.eq('goal_id', goalId)
    }

    if (date) {
      query = query.eq('date', date)
    }

    const { data: tasks, error } = await query

    if (error) {
      console.error('Get tasks error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }

    // Get all related data in bulk to avoid N+1 queries
    const taskIds = tasks.map(task => task.id);

    // Get all photos for these tasks
    const { data: allPhotos, error: photosError } = await supabase
      .from('photos')
      .select('*')
      .in('task_id', taskIds);

    if (photosError) {
      console.error('Get photos error:', photosError);
    }

    // Get all learnings for these tasks
    const { data: allLearnings, error: learningsError } = await supabase
      .from('learnings')
      .select('*')
      .in('task_id', taskIds);

    if (learningsError) {
      console.error('Get learnings error:', learningsError);
    }

    // Get all notes for these tasks
    const { data: allNotes, error: notesError } = await supabase
      .from('notes')
      .select('*')
      .in('task_id', taskIds);

    if (notesError) {
      console.error('Get notes error:', notesError);
    }

    // Format tasks with their related data
    const formattedTasks = tasks.map(task => {
      const taskPhotos = allPhotos?.filter(photo => photo.task_id === task.id) || [];
      const taskLearnings = allLearnings?.filter(learning => learning.task_id === task.id) || [];
      const taskNotes = allNotes?.filter(note => note.task_id === task.id) || [];

      return {
        id: task.id,
        title: task.title,
        description: task.description,
        date: task.date,
        time: task.time,
        completed: task.completed,
        goalId: task.goal_id,  // Map the Supabase field to what frontend expects
        userId: task.user_id,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
        goal: task.goal ? {
          id: task.goal.id,
          title: task.goal.title
        } : null,
        photos: taskPhotos,
        learnings: taskLearnings,
        notes: taskNotes
      };
    });

    return NextResponse.json({ tasks: formattedTasks });
  } catch (error) {
    console.error('Get tasks error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST create a new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, title, description, date, time, goalId } = body

    if (!userId || !title || !date || !goalId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .insert([
        {
          user_id: userId,
          title,
          description,
          date,
          time,
          goal_id: goalId,
          completed: false
        }
      ])
      .select(`
        *,
        goal:goals(*)
      `)
      .single()

    if (error) {
      console.error('Create task error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }

    // Get related data for the response
    const [photosResult, learningsResult, notesResult] = await Promise.all([
      supabase.from('photos').select('*').eq('task_id', task.id),
      supabase.from('learnings').select('*').eq('task_id', task.id),
      supabase.from('notes').select('*').eq('task_id', task.id)
    ]);

    if (photosResult.error) {
      console.error('Get photos error:', photosResult.error);
    }

    if (learningsResult.error) {
      console.error('Get learnings error:', learningsResult.error);
    }

    if (notesResult.error) {
      console.error('Get notes error:', notesResult.error);
    }

    const formattedTask = {
      id: task.id,
      title: task.title,
      description: task.description,
      date: task.date,
      time: task.time,
      completed: task.completed,
      goalId: task.goal_id,  // Map the Supabase field to what frontend expects
      userId: task.user_id,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      goal: task.goal ? {
        id: task.goal.id,
        title: task.goal.title
      } : null,
      photos: photosResult.data || [],
      learnings: learningsResult.data || [],
      notes: notesResult.data || []
    }

    return NextResponse.json({ task: formattedTask }, { status: 201 })
  } catch (error) {
    console.error('Create task error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
