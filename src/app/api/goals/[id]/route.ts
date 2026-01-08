import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT update a goal
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, description, category, status, targetDate } = body

    const goal = await db.goal.update({
      where: { id: params.id },
      data: {
        title,
        description,
        category,
        status,
        targetDate: targetDate ? new Date(targetDate) : null
      }
    })

    return NextResponse.json({ goal })
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
    await db.goal.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete goal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
