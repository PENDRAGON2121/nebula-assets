'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { EstadoActivo } from '@prisma/client'
import { auth } from '@/lib/auth'
import { hasPermission } from '@/lib/rbac'
import { PERMISSIONS } from '@/config/permissions'

const ActivoSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  codigoInterno: z.string().min(1, "El código interno es obligatorio"),
  serial: z.string().optional(),
  marca: z.string().min(1, "La marca es obligatoria"),
  modelo: z.string().optional(),
  estado: z.nativeEnum(EstadoActivo),
  precioCompra: z.coerce.number().min(0, "El precio debe ser positivo"),
  fechaCompra: z.date().or(z.string().transform((str) => new Date(str))),
})

export type ActivoFormValues = z.infer<typeof ActivoSchema>

export async function createActivoAction(data: ActivoFormValues) {
  const session = await auth();
  if (!hasPermission(session?.user, PERMISSIONS.ASSETS.WRITE)) {
    return { success: false, error: "No tienes permisos para crear activos" };
  }

  const validated = ActivoSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, error: validated.error.flatten() };
  }

  try {
    await prisma.activo.create({
      data: {
        ...validated.data,
        vidaUtilMeses: 36, // Default
      },
    })
    revalidatePath('/activos')
    return { success: true }
  } catch (error) {
    console.error('Error creating activo:', error)
    return { success: false, error: "Error al crear activo (¿Código duplicado?)" }
  }
}

export async function updateActivoAction(id: string, data: ActivoFormValues) {
    const session = await auth();
    if (!hasPermission(session?.user, PERMISSIONS.ASSETS.WRITE)) {
      return { success: false, error: "No tienes permisos para actualizar activos" };
    }

    const validated = ActivoSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: validated.error.flatten() };
    }
  
    try {
      await prisma.activo.update({
        where: { id },
        data: validated.data,
      })
      revalidatePath('/activos')
      revalidatePath(`/activos/${id}`)
      return { success: true }
    } catch (error) {
      console.error('Error updating activo:', error)
      return { success: false, error: "Error al actualizar activo" }
    }
}

export async function deleteActivoAction(id: string) {
  const session = await auth();
  if (!hasPermission(session?.user, PERMISSIONS.ASSETS.DELETE)) {
    return { success: false, error: "No tienes permisos para eliminar activos" };
  }

  try {
    await prisma.activo.delete({ where: { id } })
    revalidatePath('/activos')
    return { success: true }
  } catch (error) {
    return { success: false, error: "Error al eliminar" }
  }
}
