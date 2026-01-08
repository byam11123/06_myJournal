import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hash } from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username } = body

    if (!username || username !== 'demo') {
      return NextResponse.json(
        { error: 'Only demo user can be initialized' },
        { status: 400 }
      )
    }

    // Check if demo user already exists
    const existingUser = await db.user.findFirst({
      where: { username: 'demo' }
    })

    if (existingUser) {
      return NextResponse.json({
        message: 'Demo user already exists',
        user: {
          id: existingUser.id,
          username: existingUser.username,
          email: existingUser.email,
          name: existingUser.name
        }
      })
    }

    // Create demo user
    const hashedPassword = await hash('demo123', 10)
    const user = await db.user.create({
      data: {
        username: 'demo',
        email: 'demo@example.com',
        name: 'Demo User',
        password: hashedPassword
      }
    })

    // Create demo data for demo user
    await createDemoData(user.id)

    return NextResponse.json({
      message: 'Demo user created',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Init demo error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function createDemoData(userId: string) {
  // Create demo goals
  const demoGoals = await Promise.all([
    db.goal.create({
      data: {
        title: 'Learn JavaScript',
        description: 'Master modern JavaScript and frameworks',
        category: 'Learning',
        status: 'Active',
        targetDate: new Date('2025-12-31'),
        userId
      }
    }),
    db.goal.create({
      data: {
        title: 'Get Fit',
        description: 'Achieve optimal fitness and health',
        category: 'Health',
        status: 'Active',
        targetDate: new Date('2025-06-30'),
        userId
      }
    }),
    db.goal.create({
      data: {
        title: 'Save Money',
        description: 'Build emergency fund and investments',
        category: 'Finance',
        status: 'Active',
        targetDate: new Date('2025-12-31'),
        userId
      }
    })
  ])

  // Create demo tasks
  await Promise.all([
    db.task.create({
      data: {
        title: 'Complete React tutorial',
        description: 'Follow online React course and build projects',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        completed: true,
        goalId: demoGoals[0].id,
        userId
      }
    }),
    db.task.create({
      data: {
        title: 'Morning workout',
        description: '30 minutes cardio and strength training',
        date: new Date().toISOString().split('T')[0],
        time: '07:00',
        completed: false,
        goalId: demoGoals[1].id,
        userId
      }
    }),
    db.task.create({
      data: {
        title: 'Save $100',
        description: 'Transfer $100 to savings account',
        date: new Date().toISOString().split('T')[0],
        time: '18:00',
        completed: false,
        goalId: demoGoals[2].id,
        userId
      }
    })
  ])

  // Create demo reminder
  await db.reminder.create({
    data: {
      title: 'Workout reminder',
      message: 'Time for your morning workout!',
      date: new Date().toISOString().split('T')[0],
      time: '06:55',
      type: 'browser',
      userId
    }
  })
}
