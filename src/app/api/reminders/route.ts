import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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

    const reminders = await db.reminder.findMany({
      where: { userId },
      orderBy: [
        { date: 'asc' },
        { time: 'asc' }
      ],
      include: {
        task: true
      }
    })

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

    const reminder = await db.reminder.create({
      data: {
        userId,
        taskId,
        title,
        message,
        date,
        time,
        type: type || 'browser'
      }
    })

    return NextResponse.json({ reminder }, { status: 201 })
  } catch (error) {
    console.error('Create reminder error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
