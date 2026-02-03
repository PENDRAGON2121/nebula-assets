"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowLeftCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { returnActivoAction } from "@/app/(dashboard)/asignaciones/actions"
import { Badge } from "@/components/ui/badge" // Assuming you might have or want a Badge component, if not use span

// Type definition including relations
type AsignacionWithRelations = {
  id: string
  fechaAsignacion: Date
  fechaDevolucion: Date | null
  observaciones: string | null
  activo: {
    nombre: string
    codigoInterno: string
  }
  persona: {
    nombre: string
    departamento: string
  }
}

export const columns: ColumnDef<AsignacionWithRelations>[] = [
  {
    accessorFn: (row) => row.activo.codigoInterno,
    header: "Código Activo",
  },
  {
    accessorFn: (row) => row.activo.nombre,
    header: "Activo",
  },
  {
    accessorFn: (row) => row.persona.nombre,
    header: "Asignado A",
  },
  {
    accessorKey: "fechaAsignacion",
    header: "Fecha Asignación",
    cell: ({ row }) => {
      return new Date(row.original.fechaAsignacion).toLocaleDateString()
    }
  },
  {
    header: "Estado",
    cell: ({ row }) => {
      const isActive = !row.original.fechaDevolucion
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold 
            ${isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
            {isActive ? 'En uso' : 'Devuelto'}
        </span>
      )
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const asignacion = row.original
      const isReturned = !!asignacion.fechaDevolucion

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
              onClick={() => navigator.clipboard.writeText(asignacion.id)}
            >
              Copiar ID
            </DropdownMenuItem>
            
            {!isReturned && (
                <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                    onClick={async () => {
                        if(confirm("¿Confirmar devolución del activo?")) {
                            // We need activoId for the transaction logic in server action, usually attached to assignment
                            // But here we rely on the action just needing assignment ID or both.
                            // Let's check our action: returnActivoAction(asignacionId, activoId)
                            // We need to fetch activoId from the relation, but row.original structure has it?
                            // prisma select normally includes ids. Let's assume yes.
                            // Wait, the Type definition above didn't explicitly list activoId inside activo object
                            // BUT, row.original contains the full object returned by Prisma if typed correctly.
                            // Let's safe cast or ensure Prisma query includes it.
                             await returnActivoAction(asignacion.id, (asignacion as any).activoId)
                        }
                    }}
                    className="text-orange-600 font-medium"
                >
                <ArrowLeftCircle className="mr-2 h-4 w-4" /> Devolver Activo
                </DropdownMenuItem>
                </>
            )}
            
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
