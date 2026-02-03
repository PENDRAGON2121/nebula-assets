"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Persona } from "@prisma/client"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deletePersonaAction } from "@/app/(dashboard)/personas/actions"

import Link from "next/link"

export const columns: ColumnDef<Persona>[] = [
  {
    accessorKey: "nombre",
    header: "Nombre",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "departamento",
    header: "Departamento",
  },
  {
    accessorKey: "cargo",
    header: "Cargo",
  },
  {
    accessorKey: "activo",
    header: "Estado",
    cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold 
            ${row.original.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {row.original.activo ? 'Activo' : 'Inactivo'}
        </span>
    )
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const persona = row.original
 
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(persona.id)}
            >
              Copiar ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link href={`/personas/${persona.id}`}>Ver Detalle / Historial</Link>
            </DropdownMenuItem>
            <DropdownMenuItem 
                onClick={async () => {
                    if(confirm("¿Seguro que quieres eliminar esta persona?")) {
                        await deletePersonaAction(persona.id)
                    }
                }}
                className="text-red-600"
            >
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
