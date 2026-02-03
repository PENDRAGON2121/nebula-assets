'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { TipoMantenimiento } from '@prisma/client'

const CreateMantenimientoSchema = z.object({
  activoId: z.string().min(1, "Activo requerido"),
  tipo: z.nativeEnum(TipoMantenimiento),
  descripcion: z.string().min(1, "Descripción requerida"),
  realizadoPor: z.string().optional(),
  fechaInicio: z.date().or(z.string().transform((str) => new Date(str))),
})

const FinishMantenimientoSchema = z.object({
  mantenimientoId: z.string(),
  activoId: z.string(),
  costo: z.coerce.number().min(0),
  fechaFin: z.date().or(z.string().transform((str) => new Date(str))),
})

export type CreateMantenimientoFormValues = z.infer<typeof CreateMantenimientoSchema>
export type FinishMantenimientoFormValues = z.infer<typeof FinishMantenimientoSchema>

export async function createMantenimientoAction(data: CreateMantenimientoFormValues) {
  const validated = CreateMantenimientoSchema.safeParse(data);
  if (!validated.success) return { success: false, error: validated.error.flatten() };

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Create Mantenimiento
      await tx.mantenimiento.create({
        data: validated.data,
      })
      // 2. Set Asset to MANTENIMIENTO
      await tx.activo.update({
        where: { id: validated.data.activoId },
        data: { estado: 'MANTENIMIENTO' },
      })
    })

    revalidatePath('/mantenimientos')
    revalidatePath('/activos')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Error al registrar mantenimiento" }
  }
}

export async function finishMantenimientoAction(data: FinishMantenimientoFormValues) {
  const validated = FinishMantenimientoSchema.safeParse(data);
  if (!validated.success) return { success: false, error: validated.error.flatten() };

  const { mantenimientoId, activoId, costo, fechaFin } = validated.data;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Update Mantenimiento with cost and end date
      await tx.mantenimiento.update({
        where: { id: mantenimientoId },
        data: {
          costo,
          fechaFin,
        },
      })
      // 2. Free Asset
      await tx.activo.update({
        where: { id: activoId },
        data: { estado: 'DISPONIBLE' },
      })
    })

    revalidatePath('/mantenimientos')
    revalidatePath('/activos')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Error al finalizar mantenimiento" }
  }
}
