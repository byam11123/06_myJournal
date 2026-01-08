import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseConnection'

// GET all reminders for a user
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

    const { data: reminders, error } = await supabase
      .from('reminders')
      .select(`
        *,
        task:tasks!inner(*)
      `)
      .eq('user_id', userId)
      .order('date', { ascending: true })
      .order('time', { ascending: true })

    if (error) {
      console.error('Get reminders error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }

    return NextResponse.json({ reminders })
  } catch (error) {
    console.error('Get reminders error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST create a new reminder
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, taskId, title, message, date, time, type } = body

    if (!userId || !title || !date || !time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: reminder, error } = await supabase
      .from('reminders')
      .insert([
        {
          user_id: userId,
          task_id: taskId,
          title,
          message,
          date,
          time,
          type: type || 'browser'
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Create reminder error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }

    return NextResponse.json({ reminder }, { status: 201 })
  } catch (error) {
    console.error('Create reminder error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
