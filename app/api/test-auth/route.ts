import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()
    
    return NextResponse.json({
      message: 'Тест аутентификации',
      authenticated: !!session,
      user: session?.user || null,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Ошибка в тестовом API:', error)
    return NextResponse.json(
      { error: 'Ошибка аутентификации', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
