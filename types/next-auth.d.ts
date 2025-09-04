import NextAuth, { DefaultSession, DefaultUser } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user?: DefaultSession['user'] & { id: string; role: 'ADMIN' | 'USTADZ' | 'ORANG_TUA' }
  }
  interface User extends DefaultUser {
    role: 'ADMIN' | 'USTADZ' | 'ORANG_TUA'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: 'ADMIN' | 'USTADZ' | 'ORANG_TUA'
  }
}

