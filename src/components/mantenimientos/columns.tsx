"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { FinishMantenimientoDialog } from "./FinishMantenimientoDialog"

// Cell component to handle state for the dialog
const ActionCell = ({ row }: { row: any }) => {
  const mantenimiento = row.original
  const isActive = !mantenimiento.fechaFin
  const [showFinishDialog, setShowFinishDialog] = useState(false)

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
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(mantenimiento.id)}
          >
            Copiar ID
          </DropdownMenuItem>
          {isActive && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setShowFinishDialog(true)}
                className="text-green-600 font-medium"
              >
                <CheckCircle className="mr-2 h-4 w-4" /> Finalizar
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {showFinishDialog && (
        <FinishMantenimientoDialog 
            isOpen={showFinishDialog} 
            onClose={() => setShowFinishDialog(false)}
            mantenimientoId={mantenimiento.id}
            activoId={mantenimiento.activoId}
        />
      )}
    </>
  )
}

export const columns: ColumnDef<any>[] = [
  {
    id: "activoNombre",
    accessorFn: (row) => row.activo?.nombre || 'Unknown',
    header: "Activo",
  },
  {
    accessorKey: "tipo",
    header: "Tipo",
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
  },
  {
    accessorKey: "fechaInicio",
    header: "Inicio",
    cell: ({ row }) => new Date(row.getValue("fechaInicio")).toLocaleDateString()
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const estado = row.original.estado
      const colors: Record<string, string> = {
          PROGRAMADO: "bg-blue-100 text-blue-800",
          EN_PROCESO: "bg-yellow-100 text-yellow-800",
          COMPLETADO: "bg-green-100 text-green-800",
          CANCELADO: "bg-red-100 text-red-800"
      }
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[estado] || 'bg-gray-100 text-gray-800'}`}>
            {estado}
        </span>
      )
    }
  },
  {
    id: "comprobante",
    header: "Adjunto",
    cell: ({ row }) => {
        const url = row.original.comprobanteUrl
        if (!url) return <span className="text-gray-400 text-xs">-</span>
        return (
            <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm font-medium">
                Ver Archivo
            </a>
        )
    }
  },
  {
    accessorKey: "costo",
    header: "Costo",
    cell: ({ row }) => {
        const val = row.getValue("costo")
        if (!val) return '-'
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(val))
    }
  },
  {
    id: "actions",
    cell: ActionCell,
  },
]
