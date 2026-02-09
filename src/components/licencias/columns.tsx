"use client"

import { ColumnDef, Row } from "@tanstack/react-table"
import { Licencia } from "@prisma/client"
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
import { deleteLicenciaAction } from "@/app/(dashboard)/licencias/actions"
import Link from "next/link"
import { useState } from "react"
import { EditLicenciaDialog } from "./EditLicenciaDialog"

const estadoLabels: Record<string, string> = {
  ACTIVA: 'Activa',
  EXPIRADA: 'Expirada',
  POR_RENOVAR: 'Por Renovar',
  CANCELADA: 'Cancelada',
}

const tipoLabels: Record<string, string> = {
  PERPETUA: 'Perpetua',
  SUSCRIPCION: 'Suscripción',
  PRUEBA: 'Prueba',
  OEM: 'OEM',
}

function LicenciaActions({ row }: { row: Row<Licencia> }) {
  const licencia = row.original
  const [showEdit, setShowEdit] = useState(false)

  return (
    <>
      <EditLicenciaDialog
        open={showEdit}
        onOpenChange={setShowEdit}
        licencia={licencia}
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
            onClick={() => navigator.clipboard.writeText(licencia.id)}
          >
            Copiar ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/licencias/${licencia.id}`}>Ver Detalle</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setShowEdit(true)}>
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={async () => {
              if (confirm("¿Seguro que quieres eliminar esta licencia?")) {
                await deleteLicenciaAction(licencia.id)
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

export const columns: ColumnDef<Licencia>[] = [
  {
    accessorKey: "nombre",
    header: "Software / Servicio",
  },
  {
    accessorKey: "proveedor",
    header: "Proveedor",
  },
  {
    accessorKey: "tipoLicencia",
    header: "Tipo",
    cell: ({ row }) => {
      const tipo = row.getValue("tipoLicencia") as string;
      return <span>{tipoLabels[tipo] || tipo}</span>
    }
  },
  {
    id: "disponibilidad",
    header: "Disponibles / Total",
    cell: ({ row }) => {
      const total = row.original.cantidadTotal;
      const asignadas = row.original.cantidadAsignada;
      const disponibles = total - asignadas;
      return (
        <span className={`font-medium ${disponibles === 0 ? 'text-red-600' : disponibles <= 2 ? 'text-yellow-600' : 'text-green-600'}`}>
          {disponibles} / {total}
        </span>
      )
    }
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const estado = row.getValue("estado") as string;
      let colorClass = 'bg-gray-100 text-gray-800';
      if (estado === 'ACTIVA') colorClass = 'bg-green-100 text-green-800';
      else if (estado === 'POR_RENOVAR') colorClass = 'bg-yellow-100 text-yellow-800';
      else if (estado === 'EXPIRADA') colorClass = 'bg-red-100 text-red-800';
      else if (estado === 'CANCELADA') colorClass = 'bg-gray-100 text-gray-800';

      return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
          {estadoLabels[estado] || estado}
        </span>
      )
    }
  },
  {
    accessorKey: "fechaExpiracion",
    header: "Expira",
    cell: ({ row }) => {
      const fecha = row.getValue("fechaExpiracion") as Date | null;
      if (!fecha) return <span className="text-muted-foreground">Perpetua</span>;

      const expDate = new Date(fecha);
      const now = new Date();
      const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      let colorClass = '';
      if (diffDays < 0) colorClass = 'text-red-600 font-semibold';
      else if (diffDays <= 30) colorClass = 'text-yellow-600 font-semibold';

      return (
        <span className={colorClass}>
          {expDate.toLocaleDateString()}
          {diffDays >= 0 && diffDays <= 30 && ` (${diffDays}d)`}
          {diffDays < 0 && ' (Vencida)'}
        </span>
      )
    }
  },
  {
    id: "actions",
    cell: ({ row }) => <LicenciaActions row={row} />
  },
]
