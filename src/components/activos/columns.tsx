"use client"

import { ColumnDef, Row } from "@tanstack/react-table"
import { Activo } from "@prisma/client"
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
import { deleteActivoAction } from "@/app/(dashboard)/activos/actions"
import Link from "next/link"
import { useState } from "react"
import { EditActivoDialog } from "./EditActivoDialog"

function ActivoActions({ row }: { row: Row<Activo> }) {
  const activo = row.original
  const [showEdit, setShowEdit] = useState(false)

  return (
    <>
      <EditActivoDialog 
        open={showEdit} 
        onOpenChange={setShowEdit} 
        activo={activo} 
      />
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
            onClick={() => navigator.clipboard.writeText(activo.id)}
          >
            Copiar ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
              <Link href={`/activos/${activo.id}`}>Ver Detalle / QR</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setShowEdit(true)}>
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem 
              onClick={async () => {
                  if(confirm("¿Seguro que quieres eliminar este activo?")) {
                      await deleteActivoAction(activo.id)
                  }
              }}
              className="text-red-600"
          >
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export const columns: ColumnDef<Activo>[] = [
  {
    accessorKey: "codigoInterno",
    header: "Código",
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
  },
  {
    accessorKey: "marca",
    header: "Marca",
  },
  {
    accessorKey: "modelo",
    header: "Modelo",
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const estado = row.getValue("estado") as string;
      let colorClass = 'bg-gray-100 text-gray-800';
      if (estado === 'DISPONIBLE') colorClass = 'bg-green-100 text-green-800';
      else if (estado === 'ASIGNADO') colorClass = 'bg-blue-100 text-blue-800';
      else if (estado === 'MANTENIMIENTO') colorClass = 'bg-yellow-100 text-yellow-800';
      else if (estado === 'BAJA') colorClass = 'bg-red-100 text-red-800';

      return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
          {estado}
        </span>
      )
    }
  },
  {
    id: "actions",
    cell: ({ row }) => <ActivoActions row={row} />
  },
]
