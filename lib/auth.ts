import type { NextAuthOptions, User as NextAuthUser } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login'
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Username / Email / NIS', type: 'text' },
        password: { label: 'Password', type: 'password' },
        role: { label: 'Role', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) return null
        const identifierRaw = credentials.identifier.trim()
        const ilc = identifierRaw.toLowerCase()
        const isNumeric = /^\d{3,}$/.test(identifierRaw)
        const requestedRole = (credentials.role || '').toUpperCase()
        const wantRole: 'USTADZ' | 'ORANG_TUA' | 'ADMIN' | '' =
          requestedRole === 'USTADZ' || requestedRole === 'ORANG_TUA' || requestedRole === 'ADMIN' ? (requestedRole as any) : ''

        // Robust case-insensitive search for username/email
        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { username: { equals: identifierRaw, mode: 'insensitive' } as any },
              { email: { equals: identifierRaw, mode: 'insensitive' } as any },
            ],
          },
        })
        // Fallbacks for environments without 'mode: insensitive'
        if (!user) user = await prisma.user.findFirst({ where: { OR: [ { username: ilc }, { email: ilc } ] } })
        if (!user && ilc !== identifierRaw) user = await prisma.user.findFirst({ where: { OR: [ { username: identifierRaw }, { email: identifierRaw } ] } })

        // If not found and identifier looks like NIS (numeric), try NIS -> parent account (only when role Orang Tua or unspecified)
        if (!user && isNumeric && (wantRole === 'ORANG_TUA' || wantRole === '')) {
          const santri = await prisma.santri.findUnique({ where: { nis: identifierRaw } })
          if (santri?.parentId) user = await prisma.user.findUnique({ where: { id: santri.parentId } })
        }

        if (!user) return null

        // Enforce role if provided: avoid cross-role logins
        if (wantRole && user.role !== wantRole) return null
        
        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null
        return { id: user.id, name: user.name, email: user.email, role: user.role } as unknown as NextAuthUser
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id
        token.role = (user as any).role
        token.name = user.name
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = token.id
        ;(session.user as any).role = token.role
      }
      return session
    }
  }
}

export type SessionUser = {
  id: string
  name: string | null
  email: string | null
  role: 'ADMIN' | 'USTADZ' | 'ORANG_TUA'
}
