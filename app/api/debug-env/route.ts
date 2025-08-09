import { NextResponse } from 'next/server'

export async function GET() {
  const envVars = {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'Not set',
    NEXT_SERVER_ACTIONS_ENCRYPTION_KEY: process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY ? 'Present' : 'Missing',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Present' : 'Missing',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'Not set',
    AUTH_LOGIN: process.env.AUTH_LOGIN || 'Not set',
    AUTH_PASS: process.env.AUTH_PASS ? 'Present' : 'Missing',
    NODE_ENV: process.env.NODE_ENV || 'Not set',
  }

  return NextResponse.json({
    message: 'Environment variables check',
    envVars,
    timestamp: new Date().toISOString()
  })
}
