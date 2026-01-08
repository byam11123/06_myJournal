import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseConnection'
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
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('username', 'demo')
      .single()

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
    const { data: user, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          username: 'demo',
          email: 'demo@example.com',
          name: 'Demo User',
          password: hashedPassword
        }
      ])
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create demo user' },
        { status: 500 }
      )
    }

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
  const { data: demoGoals, error: goalsError } = await supabase
    .from('goals')
    .insert([
      {
        title: 'Learn JavaScript',
        description: 'Master modern JavaScript and frameworks',
        category: 'Learning',
        status: 'Active',
        target_date: new Date('2025-12-31'),
        user_id: userId
      },
      {
        title: 'Get Fit',
        description: 'Achieve optimal fitness and health',
        category: 'Health',
        status: 'Active',
        target_date: new Date('2025-06-30'),
        user_id: userId
      },
      {
        title: 'Save Money',
        description: 'Build emergency fund and investments',
        category: 'Finance',
        status: 'Active',
        target_date: new Date('2025-12-31'),
        user_id: userId
      }
    ])
    .select()

  if (goalsError) {
    console.error('Goals creation error:', goalsError)
    return
  }

  // Create demo tasks
  const { error: tasksError } = await supabase
    .from('tasks')
    .insert([
      {
        title: 'Complete React tutorial',
        description: 'Follow online React course and build projects',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        completed: true,
        goal_id: demoGoals[0].id,
        user_id: userId
      },
      {
        title: 'Morning workout',
        description: '30 minutes cardio and strength training',
        date: new Date().toISOString().split('T')[0],
        time: '07:00',
        completed: false,
        goal_id: demoGoals[1].id,
        user_id: userId
      },
      {
        title: 'Save $100',
        description: 'Transfer $100 to savings account',
        date: new Date().toISOString().split('T')[0],
        time: '18:00',
        completed: false,
        goal_id: demoGoals[2].id,
        user_id: userId
      }
    ])

  if (tasksError) {
    console.error('Tasks creation error:', tasksError)
    return
  }

  // Create demo reminder
  const { error: reminderError } = await supabase
    .from('reminders')
    .insert([
      {
        title: 'Workout reminder',
        message: 'Time for your morning workout!',
        date: new Date().toISOString().split('T')[0],
        time: '06:55',
        type: 'browser',
        user_id: userId
      }
    ])

  if (reminderError) {
    console.error('Reminder creation error:', reminderError)
    return
  }
}
