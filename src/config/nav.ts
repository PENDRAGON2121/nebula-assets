import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ArrowLeftRight, 
  Wrench, 
  Settings, 
  LucideIcon,
  UserCog
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon | any;
}

export const navItems: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/activos', label: 'Activos', icon: Package },
  { href: '/personas', label: 'Personas', icon: Users },
  { href: '/asignaciones', label: 'Asignaciones', icon: ArrowLeftRight },
  { href: '/mantenimientos', label: 'Mantenimientos', icon: Wrench },
  { href: '/usuarios', label: 'Usuarios', icon: UserCog },
  { href: '/configuracion', label: 'Configuración', icon: Settings },
];
