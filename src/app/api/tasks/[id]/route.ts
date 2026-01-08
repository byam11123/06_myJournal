import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseConnection'

// PUT update task
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { id } = await params; // Await params to resolve the promise
    const { title, description, date, time, goalId } = body

    const { data: task, error } = await supabase
      .from('tasks')
      .update({
        title,
        description,
        date,
        time,
        goal_id: goalId
      })
      .eq('id', id)
      .select(`
        *,
        goal:goals(*)
      `)
      .single()

    if (error) {
      console.error('PUT task error:', error)
      return NextResponse.json(
        { error: 'Failed to update task' },
        { status: 500 }
      )
    }

    // Format the task to match frontend expectations
    const formattedTask = {
      id: task.id,
      title: task.title,
      description: task.description,
      date: task.date,
      time: task.time,
      completed: task.completed,
      goalId: task.goal_id,
      userId: task.user_id,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      goal: task.goal ? {
        id: task.goal.id,
        title: task.goal.title
      } : null
    }

    return NextResponse.json({ task: formattedTask })
  } catch (error) {
    console.error('PUT task error:', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

// PATCH toggle task completion
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params; // Await params to resolve the promise
  console.log('PATCH request received for task:', id)

  try {
    const body = await request.json()
    console.log('Request body:', body)
    const { completed } = body

    if (typeof completed !== 'boolean') {
      console.error('Invalid completed value:', completed)
      return NextResponse.json(
        { error: 'Invalid completed value. Must be true or false.' },
        { status: 400 }
      )
    }

    console.log('Updating task:', id, 'completed:', completed)

    const { data: task, error } = await supabase
      .from('tasks')
      .update({ completed })
      .eq('id', id)
      .select(`
        *,
        goal:goals(*)
      `)
      .single()

    if (error) {
      console.error('PATCH task error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to toggle task' },
        { status: 500 }
      )
    }

    console.log('Updated task:', task)

    // Format the task to match frontend expectations
    const formattedTask = {
      id: task.id,
      title: task.title,
      description: task.description,
      date: task.date,
      time: task.time,
      completed: task.completed,
      goalId: task.goal_id,
      userId: task.user_id,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      goal: task.goal ? {
        id: task.goal.id,
        title: task.goal.title
      } : null
    }

    return NextResponse.json({ task: formattedTask })
  } catch (error) {
    console.error('PATCH task error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to toggle task' },
      { status: 500 }
    )
  }
}

// DELETE task
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params; // Await params to resolve the promise

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('DELETE task error:', error)
      return NextResponse.json(
        { error: 'Failed to delete task' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE task error:', error)
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}
