import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseConnection'

// PUT update a goal
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params; // Await params to resolve the promise
    const body = await request.json()
    const { title, description, category, status, targetDate } = body

    const { data: goal, error } = await supabase
      .from('goals')
      .update({
        title,
        description,
        category,
        status,
        target_date: targetDate ? new Date(targetDate).toISOString() : null
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update goal error:', error)
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

    return NextResponse.json({ goal: formattedGoal })
  } catch (error) {
    console.error('Update goal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE a goal
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params; // Await params to resolve the promise

    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete goal error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete goal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
