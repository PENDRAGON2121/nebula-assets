"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Asignacion, Persona, Activo } from "@prisma/client"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

// Define a looser type for props since they come serialized from Server Component
type RecentAssignment = {
    id: string;
    fechaAsignacion: string | Date; // Can be string after JSON serialization
    persona: {
        nombre: string;
        email: string;
    };
    activo: {
        nombre: string;
    };
}

interface RecentAssignmentsProps {
    asignaciones: RecentAssignment[]
}

export function RecentAssignments({ asignaciones }: RecentAssignmentsProps) {
  return (
    <div className="space-y-8">
      {asignaciones.map((asignacion) => {
        const initials = asignacion.persona.nombre
            .split(' ')
            .map(n => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
            
        // Handle date safely whether it's Date object or ISO string
        const dateObj = new Date(asignacion.fechaAsignacion);

        return (
            <div className="flex items-center" key={asignacion.id}>
                <Avatar className="h-9 w-9">
                <AvatarImage src="/avatars/01.png" alt="Avatar" />
                <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{asignacion.persona.nombre}</p>
                <p className="text-sm text-muted-foreground">
                    {asignacion.persona.email}
                </p>
                </div>
                <div className="ml-auto flex flex-col items-end">
                    <div className="font-medium text-sm">
                        {asignacion.activo.nombre}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        Hace {!isNaN(dateObj.getTime()) ? formatDistanceToNow(dateObj, { locale: es }) : ''}
                    </div>
                </div>
            </div>
        )
      })}

      {asignaciones.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No hay asignaciones recientes.</p>
      )}
    </div>
  )
}
