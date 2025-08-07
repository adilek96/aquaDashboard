import { useSession, signOut } from 'next-auth/react'

export function useAuth() {
  const { data: session, status } = useSession()

  const logout = async () => {
    await signOut({ callbackUrl: '/auth/signin' })
  }

  return {
    isAuthenticated: !!session,
    user: session?.user?.name || null,
    loading: status === 'loading',
    logout
  }
}
