"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState } from "react"
import { UserDialog } from "./UserDialog"
import { deleteUser } from "@/app/(dashboard)/usuarios/actions"

export type UserObj = {
  id: string
  name: string | null
  email: string
  role: "ADMIN" | "USER"
  image: string | null
  createdAt: Date
}

const ActionCell = ({ row }: { row: any }) => {
  const user = row.original as UserObj
  const [showEditDialog, setShowEditDialog] = useState(false)

  const handleDelete = async () => {
      if (confirm("¿Estás seguro de eliminar este usuario?")) {
          const res = await deleteUser(user.id);
          if (!res.success) alert(res.error);
      }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Pencil className="mr-2 h-4 w-4" /> Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDelete} className="text-red-600">
            <Trash className="mr-2 h-4 w-4" /> Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {showEditDialog && (
          <UserDialog 
            user={user} 
            isOpen={showEditDialog} 
            onClose={() => setShowEditDialog(false)} 
          />
      )}
    </>
  )
}

export const columns: ColumnDef<UserObj>[] = [
  {
    accessorKey: "image",
    header: "",
    cell: ({ row }) => {
        const name = row.original.name || "U"
        return (
            <Avatar className="h-8 w-8">
                <AvatarImage src={row.original.image || undefined} />
                <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
        )
    }
  },
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Rol",
    cell: ({ row }) => {
        const role = row.original.role
        return (
            <Badge variant={role === 'ADMIN' ? 'default' : 'secondary'}>
                {role}
            </Badge>
        )
    }
  },
  {
    id: "actions",
    cell: ActionCell,
  },
]
