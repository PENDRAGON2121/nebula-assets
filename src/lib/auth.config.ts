import type { NextAuthConfig } from 'next-auth';
import { PERMISSIONS } from '@/config/permissions';

function hasPermission(user: any, permission: string): boolean {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    return user.permissions?.includes(permission) || false;
}

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      
      // Protect dashboard routes
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard') || 
                            nextUrl.pathname.startsWith('/activos') ||
                            nextUrl.pathname.startsWith('/personas') ||
                            nextUrl.pathname.startsWith('/asignaciones') ||
                            nextUrl.pathname.startsWith('/mantenimientos') ||
                            nextUrl.pathname.startsWith('/configuracion') ||
                            nextUrl.pathname.startsWith('/reportes') ||
                            nextUrl.pathname.startsWith('/usuarios') ||
                            nextUrl.pathname === '/'; // Root is likely dashboard

      const isOnLogin = nextUrl.pathname.startsWith('/login');

      if (isOnDashboard) {
        if (isLoggedIn) {
          // RBAC Checks
          const user = auth.user;
          const path = nextUrl.pathname;

          if (path.startsWith('/activos') && !hasPermission(user, PERMISSIONS.ASSETS.READ)) return false;
          if (path.startsWith('/personas') && !hasPermission(user, PERMISSIONS.PEOPLE.READ)) return false;
          if (path.startsWith('/asignaciones') && !hasPermission(user, PERMISSIONS.ASSIGNMENTS.READ)) return false;
          if (path.startsWith('/mantenimientos') && !hasPermission(user, PERMISSIONS.MAINTENANCE.READ)) return false;
          if (path.startsWith('/usuarios') && !hasPermission(user, PERMISSIONS.USERS.READ)) return false;
          
          return true;
        }
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
