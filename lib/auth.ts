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

            return null
          }

          // Получаем учетные данные из переменных окружения
          const authLogin = process.env.AUTH_LOGIN
          const authPass = process.env.AUTH_PASS

          // Проверяем, что переменные окружения установлены
          if (!authLogin || !authPass) {
            throw new Error("Конфигурация аутентификации не настроена");
          }

          // Проверяем логин и пароль
          if (credentials.username === authLogin && credentials.password === authPass) {

            return {
              id: "1",
              name: credentials.username,
              email: "admin@aquadaddy.app",
              role: "admin"
            }
          }


          return null
        } catch (error) {
          return null;
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
