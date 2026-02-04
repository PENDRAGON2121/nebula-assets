'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { TipoMantenimiento, EstadoMantenimiento } from '@prisma/client'
import { auth } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { hasPermission } from '@/lib/rbac'
import { PERMISSIONS } from '@/config/permissions'

const CreateMantenimientoSchema = z.object({
  activoId: z.string().min(1, "Activo requerido"),
  tipo: z.nativeEnum(TipoMantenimiento),
  estado: z.nativeEnum(EstadoMantenimiento).default('PROGRAMADO'),
  descripcion: z.string().min(1, "Descripción requerida"),
  realizadoPor: z.string().optional(),
  fechaInicio: z.date().or(z.string().transform((str) => new Date(str))),
  costo: z.coerce.number().optional().nullable(),
})

const FinishMantenimientoSchema = z.object({
  mantenimientoId: z.string(),
  activoId: z.string(),
  costo: z.coerce.number().min(0),
  fechaFin: z.date().or(z.string().transform((str) => new Date(str))),
})

export async function createMantenimientoAction(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
      return { success: false, error: "No autorizado" }
  }
  
  if (!hasPermission(session.user, PERMISSIONS.MAINTENANCE.WRITE)) {
      return { success: false, error: "No tienes permisos para registrar mantenimientos" };
  }

  const file = formData.get('comprobante') as File | null
  
  // Extract data for validation
  const rawData = {
      activoId: formData.get('activoId'),
      tipo: formData.get('tipo'),
      estado: formData.get('estado') || 'PROGRAMADO',
      descripcion: formData.get('descripcion'),
      realizadoPor: formData.get('realizadoPor'),
      fechaInicio: formData.get('fechaInicio'),
      costo: formData.get('costo') || null,
  }

  const validated = CreateMantenimientoSchema.safeParse(rawData);
  
  if (!validated.success) {
      return { success: false, error: validated.error.flatten() };
  }

  let comprobanteUrl = undefined;

  // File Upload Logic
  if (file && file.size > 0) {
      if (file.size > 10 * 1024 * 1024) { 
          return { success: false, error: "El archivo es demasiado grande (máximo 10MB)" }
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
          return { success: false, error: "Tipo de archivo no permitido. Solo se permiten imágenes y PDF." }
      }

      try {
          const bytes = await file.arrayBuffer()
          const buffer = Buffer.from(bytes)

          const timestamp = Date.now()
          const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_')
          const filename = `maint-${timestamp}-${cleanFileName}`
          const uploadDir = join(process.cwd(), 'public', 'uploads', 'mantenimientos')
          
          await mkdir(uploadDir, { recursive: true })
          
          const filepath = join(uploadDir, filename)
          await writeFile(filepath, buffer)
          
          comprobanteUrl = `/uploads/mantenimientos/${filename}`
      } catch (e) {
          console.error("Upload error:", e)
          return { success: false, error: "Error al subir el archivo comprobante" }
      }
  }

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Create Mantenimiento
      await tx.mantenimiento.create({
        data: {
            ...validated.data,
            comprobanteUrl
        },
      })
      
      // 2. Update Asset State based on Maintenance State
      // If maintenance is EN_PROCESO, set asset to MANTENIMIENTO
      if (validated.data.estado === 'EN_PROCESO') {
          await tx.activo.update({
            where: { id: validated.data.activoId },
            data: { estado: 'MANTENIMIENTO' },
          })
      }
    })

    revalidatePath('/mantenimientos')
    revalidatePath(`/activos/${validated.data.activoId}`)
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Error al registrar mantenimiento" }
  }
}

export async function finishMantenimientoAction(formData: FormData) {
  // Adapted to accept FormData for potential file upload on finish too (e.g. final invoice)
  // For now, keeping logic similar but parsing FormData
  
  const session = await auth();
  if (!hasPermission(session?.user, PERMISSIONS.MAINTENANCE.WRITE)) {
      return { success: false, error: "No tienes permisos para finalizar mantenimientos" };
  }

  const rawData = {
      mantenimientoId: formData.get('mantenimientoId'),
      activoId: formData.get('activoId'),
      costo: formData.get('costo'),
      fechaFin: formData.get('fechaFin'),
  }
  
  const validated = FinishMantenimientoSchema.safeParse(rawData);
  if (!validated.success) return { success: false, error: validated.error.flatten() };

  const { mantenimientoId, activoId, costo, fechaFin } = validated.data;
  const file = formData.get('comprobante') as File | null
  
  let comprobanteUrl = undefined;
  
  // Reuse upload logic if a file is provided on finish
  if (file && file.size > 0) {
      // ... (duplicate upload logic or extract to shared function later. For now, inline to keep single file)
       try {
          const bytes = await file.arrayBuffer()
          const buffer = Buffer.from(bytes)
          const timestamp = Date.now()
          const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_')
          const filename = `maint-finish-${timestamp}-${cleanFileName}`
          const uploadDir = join(process.cwd(), 'public', 'uploads', 'mantenimientos')
          await mkdir(uploadDir, { recursive: true })
          const filepath = join(uploadDir, filename)
          await writeFile(filepath, buffer)
          comprobanteUrl = `/uploads/mantenimientos/${filename}`
      } catch (e) {
          console.error("Upload error:", e)
          return { success: false, error: "Error al subir el archivo comprobante" }
      }
  }

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Update Mantenimiento
      await tx.mantenimiento.update({
        where: { id: mantenimientoId },
        data: {
          costo,
          fechaFin,
          estado: 'COMPLETADO',
          ...(comprobanteUrl && { comprobanteUrl }) // Update URL if new one provided
        },
      })
      // 2. Free Asset
      await tx.activo.update({
        where: { id: activoId },
        data: { estado: 'DISPONIBLE' },
      })
    })

    revalidatePath('/mantenimientos')
    revalidatePath(`/activos/${activoId}`)
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Error al finalizar mantenimiento" }
  }
}
