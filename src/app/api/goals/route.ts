import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseConnection'

// GET all goals for a user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // First get the goals
    const { data: goals, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Get goals error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }

    // Then get task counts for each goal
    const formattedGoals = await Promise.all(goals.map(async (goal) => {
      const { count, error: taskCountError } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('goal_id', goal.id)

      if (taskCountError) {
        console.error('Get task count error:', taskCountError)
        var taskCount = 0
      } else {
        var taskCount = count || 0
      }

      return {
        id: goal.id,
        title: goal.title,
        description: goal.description,
        category: goal.category,
        status: goal.status,
        targetDate: goal.target_date,
        userId: goal.user_id,
        createdAt: goal.created_at,
        updatedAt: goal.updated_at,
        _count: {
          tasks: taskCount
        }
      }
    }))

    return NextResponse.json({ goals: formattedGoals })
  } catch (error) {
    console.error('Get goals error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST create a new goal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, title, description, category, status, targetDate } = body

    if (!userId || !title || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: goal, error } = await supabase
      .from('goals')
      .insert([
        {
          user_id: userId,
          title,
          description,
          category,
          status: status || 'Active',
          target_date: targetDate ? new Date(targetDate).toISOString() : null
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Create goal error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }

    // Format the response to match the expected structure
    const formattedGoal = {
      id: goal.id,
      title: goal.title,
      description: goal.description,
      category: goal.category,
      status: goal.status,
      targetDate: goal.target_date,
      userId: goal.user_id,
      createdAt: goal.created_at,
      updatedAt: goal.updated_at
    }

    return NextResponse.json({ goal: formattedGoal }, { status: 201 })
  } catch (error) {
    console.error('Create goal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
