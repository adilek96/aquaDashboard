import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Логин", type: "text" },
        password: { label: "Пароль", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.username || !credentials?.password) {
            console.log("Отсутствуют учетные данные")
            return null
          }

          // Получаем учетные данные из переменных окружения
          const authLogin = process.env.AUTH_LOGIN
          const authPass = process.env.AUTH_PASS

          // Проверяем, что переменные окружения установлены
          if (!authLogin || !authPass) {
            console.error("Конфигурация аутентификации не настроена")
            return null
          }

          // Проверяем логин и пароль
          if (credentials.username === authLogin && credentials.password === authPass) {
            console.log("Успешная аутентификация для пользователя:", credentials.username)
            return {
              id: "1",
              name: credentials.username,
              email: "admin@aquadaddy.app",
              role: "admin"
            }
          }

          console.log("Неверные учетные данные")
          return null
        } catch (error) {
          console.error("Ошибка в authorize:", error)
          return null
        }
      }
    })
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role as string
      }
      return session
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 дней
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
})
