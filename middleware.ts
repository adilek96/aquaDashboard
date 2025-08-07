import { auth } from "@/lib/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { nextUrl } = req

  // Разрешаем доступ к API аутентификации и страницам аутентификации
  if (nextUrl.pathname.startsWith('/api/auth') || nextUrl.pathname.startsWith('/auth')) {
    return null
  }

  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!isLoggedIn) {
    return Response.redirect(new URL('/auth/signin', nextUrl))
  }

  return null
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - auth (auth pages)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|auth|_next/static|_next/image|favicon.ico).*)",
  ],
}
