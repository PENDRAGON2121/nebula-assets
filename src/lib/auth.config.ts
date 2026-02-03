import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      
      // Protect dashboard routes
      // Note: The structure has (dashboard) which routes to /, /activos, etc. 
      // Need to determine what paths are protected.
      // Assuming everything inside (dashboard) is what we want to protect.
      // But typically we check path segments.
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard') || 
                            nextUrl.pathname.startsWith('/activos') ||
                            nextUrl.pathname.startsWith('/personas') ||
                            nextUrl.pathname.startsWith('/asignaciones') ||
                            nextUrl.pathname.startsWith('/mantenimientos') ||
                            nextUrl.pathname.startsWith('/configuracion') ||
                            nextUrl.pathname.startsWith('/reportes') ||
                            nextUrl.pathname === '/'; // Root is likely dashboard

      const isOnLogin = nextUrl.pathname.startsWith('/login');

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isOnLogin) {
        if (isLoggedIn) {
          return Response.redirect(new URL('/', nextUrl));
        }
      }
      return true;
    },
  },
  providers: [], // configured in auth.ts
} satisfies NextAuthConfig;
