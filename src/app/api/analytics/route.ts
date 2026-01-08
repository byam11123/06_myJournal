import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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

    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    // Get all data
    const [goals, tasks, photos] = await Promise.all([
      db.goal.findMany({
        where: { userId },
        include: {
          _count: {
            select: { tasks: true }
          }
        }
      }),
      db.task.findMany({
        where: { userId }
      }),
      db.photo.findMany({
        where: {
          task: {
            userId
          }
        }
      })
    ])

    // Calculate analytics
    const totalGoals = goals.length
    const activeGoals = goals.filter(g => g.status === 'Active').length
    const completedGoals = goals.filter(g => g.status === 'Completed').length

    const totalTasks = tasks.length
    const todayTasks = tasks.filter(t => t.date === today)
    const todayCompletedTasks = todayTasks.filter(t => t.completed).length

    const yesterdayTasks = tasks.filter(t => t.date === yesterday)
    const yesterdayCompletedTasks = yesterdayTasks.filter(t => t.completed).length
    const yesterdayIncompleteTasks = yesterdayTasks.filter(t => !t.completed).length

    const totalPhotos = photos.length

    // Category breakdown
    const categoryBreakdown = goals.reduce((acc, goal) => {
      acc[goal.category] = (acc[goal.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Calculate goal progress
    const goalProgress = goals.map(goal => {
      const goalTasks = tasks.filter(t => t.goalId === goal.id)
      const completedTasks = goalTasks.filter(t => t.completed)
      const progress = goalTasks.length > 0
        ? Math.round((completedTasks.length / goalTasks.length) * 100)
        : 0

      return {
        id: goal.id,
        title: goal.title,
        progress,
        totalTasks: goalTasks.length,
        completedTasks: completedTasks.length
      }
    })

    return NextResponse.json({
      totalGoals,
      activeGoals,
      completedGoals,
      totalTasks,
      todayTasks: todayTasks.length,
      todayCompletedTasks,
      yesterdayCompletedTasks,
      yesterdayIncompleteTasks,
      totalPhotos,
      categoryBreakdown,
      goalProgress
    })
  } catch (error) {
    console.error('Get analytics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
