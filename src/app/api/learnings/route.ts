import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseConnection'

// GET all learnings for a task
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const taskId = searchParams.get('taskId')

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      )
    }

    const { data: learnings, error } = await supabase
      .from('learnings')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Get learnings error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }

    return NextResponse.json({ learnings })
  } catch (error) {
    console.error('Get learnings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST create a new learning
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { taskId, content } = body

    if (!taskId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: learning, error } = await supabase
      .from('learnings')
      .insert([
        {
          task_id: taskId,
          content
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Create learning error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }

    return NextResponse.json({ learning }, { status: 201 })
  } catch (error) {
    console.error('Create learning error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
