import { NextRequest, NextResponse } from 'next/server'
import { testConnection } from '@/lib/supabaseConnection'

export async function GET(request: NextRequest) {
  try {
    const result = await testConnection()
    
    if (result.success) {
      return NextResponse.json({ 
        message: 'Supabase connection successful!', 
        connected: true,
        data: result.data 
      })
    } else {
      return NextResponse.json({ 
        message: 'Supabase connection failed', 
        connected: false,
        error: result.error 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Supabase test error:', error)
    return NextResponse.json({ 
      message: 'Supabase connection test failed', 
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}