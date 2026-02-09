'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { EstadoLicencia, TipoLicencia } from '@prisma/client'
import { auth } from '@/lib/auth'
import { hasPermission } from '@/lib/rbac'
import { PERMISSIONS } from '@/config/permissions'

const LicenciaSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  proveedor: z.string().min(1, "El proveedor es obligatorio"),
  tipoLicencia: z.nativeEnum(TipoLicencia),
  estado: z.nativeEnum(EstadoLicencia),
  claveProducto: z.string().optional(),
  cantidadTotal: z.coerce.number().int().min(1, "Debe haber al menos 1 licencia"),
  cantidadAsignada: z.coerce.number().int().min(0).default(0),
  fechaCompra: z.date().or(z.string().transform((str) => new Date(str))),
  fechaExpiracion: z.date().or(z.string().transform((str) => new Date(str))).nullable().optional(),
  costoUnitario: z.coerce.number().min(0, "El costo debe ser positivo"),
  costoTotal: z.coerce.number().min(0, "El costo debe ser positivo"),
  autoRenovacion: z.boolean().default(false),
  diasNotificacion: z.coerce.number().int().min(0).nullable().optional(),
  notas: z.string().optional(),
})

export type LicenciaFormValues = z.infer<typeof LicenciaSchema>

export async function createLicenciaAction(data: LicenciaFormValues) {
  const session = await auth();
  if (!hasPermission(session?.user, PERMISSIONS.LICENSES.WRITE)) {
    return { success: false, error: "No tienes permisos para crear licencias" };
  }

  const validated = LicenciaSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, error: validated.error.flatten() };
  }

  try {
    await prisma.licencia.create({
      data: {
        ...validated.data,
        fechaExpiracion: validated.data.fechaExpiracion || null,
        diasNotificacion: validated.data.diasNotificacion || null,
        notas: validated.data.notas || null,
        claveProducto: validated.data.claveProducto || null,
      },
    })
    revalidatePath('/licencias')
    return { success: true }
  } catch (error) {
    console.error('Error creating licencia:', error)
    return { success: false, error: "Error al crear licencia" }
  }
}

export async function updateLicenciaAction(id: string, data: LicenciaFormValues) {
  const session = await auth();
  if (!hasPermission(session?.user, PERMISSIONS.LICENSES.WRITE)) {
    return { success: false, error: "No tienes permisos para actualizar licencias" };
  }

  const validated = LicenciaSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, error: validated.error.flatten() };
  }

  try {
    await prisma.licencia.update({
      where: { id },
      data: {
        ...validated.data,
        fechaExpiracion: validated.data.fechaExpiracion || null,
        diasNotificacion: validated.data.diasNotificacion || null,
        notas: validated.data.notas || null,
        claveProducto: validated.data.claveProducto || null,
      },
    })
    revalidatePath('/licencias')
    revalidatePath(`/licencias/${id}`)
    return { success: true }
  } catch (error) {
    console.error('Error updating licencia:', error)
    return { success: false, error: "Error al actualizar licencia" }
  }
}

export async function deleteLicenciaAction(id: string) {
  const session = await auth();
  if (!hasPermission(session?.user, PERMISSIONS.LICENSES.DELETE)) {
    return { success: false, error: "No tienes permisos para eliminar licencias" };
  }

  try {
    await prisma.licencia.delete({ where: { id } })
    revalidatePath('/licencias')
    return { success: true }
  } catch (error) {
    return { success: false, error: "Error al eliminar licencia" }
  }
}
