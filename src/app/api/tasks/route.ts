import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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

    const where: any = { userId }

    if (goalId) {
      where.goalId = goalId
    }

    if (date) {
      where.date = date
    }

    const tasks = await db.task.findMany({
      where,
      orderBy: [
        { date: 'asc' },
        { time: 'asc' },
        { createdAt: 'desc' }
      ],
      include: {
        goal: true,
        photos: true,
        learnings: true,
        notes: true
      }
    })

    return NextResponse.json({ tasks })
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

    const task = await db.task.create({
      data: {
        userId,
        title,
        description,
        date,
        time,
        goalId,
        completed: false
      }
    })

    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    console.error('Create task error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
