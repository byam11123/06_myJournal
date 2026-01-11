import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseConnection'

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

    // Get all data from Supabase
    const [goalsResult, tasksResult, photosResult] = await Promise.all([
      supabase
        .from('goals')
        .select(`
          *,
          tasks(count)
        `)
        .eq('user_id', userId),
      supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId),
      supabase
        .from('photos')
        .select(`
          id,
          task_id,
          url,
          created_at
        `)
        .in('task_id', (await supabase.from('tasks').select('id', { head: true }).eq('user_id', userId)).data?.map(t => t.id) || [])
    ])

    if (goalsResult.error) {
      console.error('Get goals error:', goalsResult.error)
      return NextResponse.json(
        { error: 'Failed to fetch goals' },
        { status: 500 }
      )
    }

    if (tasksResult.error) {
      console.error('Get tasks error:', tasksResult.error)
      return NextResponse.json(
        { error: 'Failed to fetch tasks' },
        { status: 500 }
      )
    }

    if (photosResult.error) {
      console.error('Get photos error:', photosResult.error)
      return NextResponse.json(
        { error: 'Failed to fetch photos' },
        { status: 500 }
      )
    }

    const goals = goalsResult.data
    const tasks = tasksResult.data
    const photos = photosResult.data

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
      const goalTasks = tasks.filter(t => t.goal_id === goal.id)
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
