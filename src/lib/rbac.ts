import { PERMISSIONS } from '@/config/permissions';

export function hasPermission(user: any, permission: string): boolean {
    if (!user) return false;
    
    // Admins have all permissions implicitly (optional strategy, but common)
    if (user.role === 'ADMIN') return true;

    // Check if user has specific permission in their list
    return user.permissions?.includes(permission) || false;
}
