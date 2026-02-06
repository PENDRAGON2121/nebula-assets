'use client';

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, CircleUser } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sidebar } from './Sidebar';
import { User } from 'next-auth';
import { signOut } from 'next-auth/react';
import { ModeToggle } from '@/components/mode-toggle';
import { CommandMenu } from '@/components/layout/CommandMenu';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header({ user, ticketsUrl }: { user?: User, ticketsUrl?: string }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0">
             <Sidebar className="border-none" ticketsUrl={ticketsUrl} /> 
        </SheetContent>
      </Sheet>
      
      <div className="w-full flex-1">
        <CommandMenu />
      </div>

      <ModeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full overflow-hidden">
            {user?.image ? (
               <Avatar className="h-8 w-8">
                 <AvatarImage src={user.image} alt={user.name || "User"} />
                 <AvatarFallback>{user.name?.substring(0, 2).toUpperCase() || "US"}</AvatarFallback>
               </Avatar>
            ) : (
              <CircleUser className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-xs text-muted-foreground">{user?.email}</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut()}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}

