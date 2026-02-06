'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { navItems } from '@/config/nav';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { hasPermission } from '@/lib/rbac';
import { Ticket, ExternalLink } from 'lucide-react';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className={cn("flex h-full flex-col bg-muted/40", className)}>
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Image src="/nebula-logo.ico" alt="Nebula Assets Logo" width={24} height={24} className="h-6 w-6" />
          <span className="">Nebula Assets</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          <div className="px-3 py-2 text-xs font-medium text-muted-foreground">Plataforma</div>
          {navItems.map((item) => {
            if (item.permission && !hasPermission(user, item.permission)) {
              return null;
            }

            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                  isActive ? "bg-muted text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="mt-6 grid items-start px-2 text-sm font-medium lg:px-4">
           <div className="px-3 py-2 text-xs font-medium text-muted-foreground">Ecosistema</div>
           <Link
              href={process.env.NEXT_PUBLIC_TICKETS_URL ?? 'http://localhost:3001'}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              target="_blank"
           >
              <Ticket className="h-4 w-4" />
              Nebula Tickets
              <ExternalLink className="ml-auto h-3 w-3 opacity-50" />
           </Link>
        </div>
      </div>
    </div>
  );
}
