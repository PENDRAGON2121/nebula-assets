import {
  LayoutDashboard,
  Package,
  Users,
  ArrowLeftRight,
  Wrench,
  Settings,
  LucideIcon,
  UserCog,
  Ticket,
  KeyRound
} from 'lucide-react';

import { PERMISSIONS } from '@/config/permissions';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon | any;
  permission?: string;
}

export const navItems: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/activos', label: 'Activos', icon: Package, permission: PERMISSIONS.ASSETS.READ },
  { href: '/personas', label: 'Personas', icon: Users, permission: PERMISSIONS.PEOPLE.READ },
  { href: '/asignaciones', label: 'Asignaciones', icon: ArrowLeftRight, permission: PERMISSIONS.ASSIGNMENTS.READ },
  { href: '/mantenimientos', label: 'Mantenimientos', icon: Wrench, permission: PERMISSIONS.MAINTENANCE.READ },
  { href: '/licencias', label: 'Licencias', icon: KeyRound, permission: PERMISSIONS.LICENSES.READ },
  { href: '/usuarios', label: 'Usuarios', icon: UserCog, permission: PERMISSIONS.USERS.READ },
  { href: '/configuracion', label: 'Configuración', icon: Settings, permission: PERMISSIONS.USERS.WRITE }, // Assuming restricted config
];
