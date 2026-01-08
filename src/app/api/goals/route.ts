import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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

    const goals = await db.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { tasks: true }
        }
      }
    })

    return NextResponse.json({ goals })
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

    const goal = await db.goal.create({
      data: {
        userId,
        title,
        description,
        category,
        status: status || 'Active',
        targetDate: targetDate ? new Date(targetDate) : null
      }
    })

    return NextResponse.json({ goal }, { status: 201 })
  } catch (error) {
    console.error('Create goal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
