import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '10'
    const search = searchParams.get('search') || ''

    const adminToken = process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY
    const userApiUrl = process.env.NEXT_PUBLIC_USER_API_URL

    if (!adminToken) {
      return NextResponse.json(
        { error: 'Admin token not configured' },
        { status: 500 }
      )
    }

    const params = new URLSearchParams()
    params.append('page', page)
    params.append('limit', limit)
    if (search) params.append('search', search)

    const response = await fetch(`${userApiUrl}/api/get-users?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const adminToken = process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY
    const userApiUrl = process.env.NEXT_PUBLIC_USER_API_URL

    if (!adminToken) {
      return NextResponse.json(
        { error: 'Admin token not configured' },
        { status: 500 }
      )
    }

    const response = await fetch(`${userApiUrl}/api/delete-user`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
