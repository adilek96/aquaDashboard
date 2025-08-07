import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: string
    }
  }

  interface User {
    id: string
    name: string
    email: string
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
  }
}

declare module "next-auth/providers/credentials" {
  interface CredentialsConfig {
    credentials: {
      username: { label: string; type: string }
      password: { label: string; type: string }
    }
  }
}

declare module "next-auth/core/types" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: string
    }
  }
}

declare module "next-auth/core/lib/types" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: string
    }
  }
}
