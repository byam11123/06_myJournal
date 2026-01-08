import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseConnection'

// PUT update task
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { id } = params
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
      .select()
      .single()

    if (error) {
      console.error('PUT task error:', error)
      return NextResponse.json(
        { error: 'Failed to update task' },
        { status: 500 }
      )
    }

    return NextResponse.json({ task })
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
  console.log('PATCH request received for task:', params.id)

  try {
    const body = await request.json()
    console.log('Request body:', body)
    const { completed } = body
    const { id } = params

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
      .select()
      .single()

    if (error) {
      console.error('PATCH task error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to toggle task' },
        { status: 500 }
      )
    }

    console.log('Updated task:', task)

    return NextResponse.json({ task })
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
    const { id } = params

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
