import NextAuth, { DefaultSession } from "next-auth"
import { Role } from "@prisma/client"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's role. */
      role: Role
      id: string
    } & DefaultSession["user"]
  }

  interface User {
      role: Role
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    role: Role
    id: string
  }
}
