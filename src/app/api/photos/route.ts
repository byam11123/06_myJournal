import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all photos for a task
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

    const photos = await db.photo.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ photos })
  } catch (error) {
    console.error('Get photos error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST create a new photo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { taskId, url } = body

    if (!taskId || !url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const photo = await db.photo.create({
      data: {
        taskId,
        url
      }
    })

    return NextResponse.json({ photo }, { status: 201 })
  } catch (error) {
    console.error('Create photo error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
