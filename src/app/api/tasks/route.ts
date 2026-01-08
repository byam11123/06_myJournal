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

    // Get related data (photos, learnings, notes) for each task
    const tasksWithRelated = await Promise.all(tasks.map(async (task) => {
      // Get photos for this task
      const { data: photos, error: photosError } = await supabase
        .from('photos')
        .select('*')
        .eq('task_id', task.id)

      if (photosError) {
        console.error('Get photos error:', photosError)
      }

      // Get learnings for this task
      const { data: learnings, error: learningsError } = await supabase
        .from('learnings')
        .select('*')
        .eq('task_id', task.id)

      if (learningsError) {
        console.error('Get learnings error:', learningsError)
      }

      // Get notes for this task
      const { data: notes, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .eq('task_id', task.id)

      if (notesError) {
        console.error('Get notes error:', notesError)
      }

      return {
        ...task,
        goal: task.goal,
        photos: photos || [],
        learnings: learnings || [],
        notes: notes || []
      }
    }))

    return NextResponse.json({ tasks: tasksWithRelated })
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
    const { data: photos, error: photosError } = await supabase
      .from('photos')
      .select('*')
      .eq('task_id', task.id)

    if (photosError) {
      console.error('Get photos error:', photosError)
    }

    const { data: learnings, error: learningsError } = await supabase
      .from('learnings')
      .select('*')
      .eq('task_id', task.id)

    if (learningsError) {
      console.error('Get learnings error:', learningsError)
    }

    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('*')
      .eq('task_id', task.id)

    if (notesError) {
      console.error('Get notes error:', notesError)
    }

    const taskWithRelated = {
      ...task,
      goal: task.goal,
      photos: photos || [],
      learnings: learnings || [],
      notes: notes || []
    }

    return NextResponse.json({ task: taskWithRelated }, { status: 201 })
  } catch (error) {
    console.error('Create task error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
