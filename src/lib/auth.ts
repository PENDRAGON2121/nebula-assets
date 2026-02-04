import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

async function getUser(email: string) {
  try {
    const user = await prisma.user.findUnique({ 
        where: { email },
        include: {
            role: {
                include: { permissions: true }
            }
        }
    });
    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  // Explicitly defined secret (falls back to hardcoded for dev/docker build sanity)
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "supersecretShouldChangeThisInProd",
  session: {
    strategy: "jwt",
  },
  // Force insecure cookies in production if using HTTP (common in Docker/internal deployments)
  useSecureCookies: process.env.NODE_ENV === 'production' && process.env.AUTH_URL?.startsWith('https://'),
  callbacks: {
    ...authConfig.callbacks, // Keep middleware compatible callbacks
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) return null;
          
          // If the user has no password (e.g. OAuth), they can't log in with credentials
          if (!user.password) return null;
           
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) {
              return {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  image: user.image,
                  role: user.role?.name || 'USER',
                  permissions: user.role?.permissions.map(p => p.name) || []
              }
          }
        }

        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
});
