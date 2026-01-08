import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseConnection'
import { hash } from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, email, name, password } = body

    // Validate required fields
    if (!username || !email || !name || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const { data: existingUsers, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .or(`username.eq.${username},email.eq.${email}`)

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create user
    const { data: user, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          username,
          email,
          name,
          password: hashedPassword
        }
      ])
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // New users start with clean database (no demo data)

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        createdAt: user.created_at
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
