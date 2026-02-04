'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { auth } from '@/lib/auth'
import { hasPermission } from '@/lib/rbac'
import { PERMISSIONS } from '@/config/permissions'

export async function createAsignacionAction(formData: FormData) {
  const session = await auth();
  if (!hasPermission(session?.user, PERMISSIONS.ASSIGNMENTS.WRITE)) {
      return { success: false, error: "No tienes permisos para crear asignaciones" };
  }

  const activoId = formData.get('activoId') as string
  const personaId = formData.get('personaId') as string
  const observaciones = formData.get('observaciones') as string
  const file = formData.get('file') as File | null

  if (!activoId || !personaId) {
      return { success: false, error: "Faltan datos requeridos" }
  }

  let hojaUrl = null

  if (file && file.size > 0) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit (updated to match config)
          return { success: false, error: "El archivo es demasiado grande (máximo 10MB)" }
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
          return { success: false, error: "Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, WEBP) y PDF." }
      }

      try {
          const bytes = await file.arrayBuffer()
          const buffer = Buffer.from(bytes)

          // Create unique filename
          const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`
          const uploadDir = join(process.cwd(), 'public', 'uploads')
          
          // Ensure dir exists
          await mkdir(uploadDir, { recursive: true })
          
          const filepath = join(uploadDir, filename)
          await writeFile(filepath, buffer)
          
          hojaUrl = `/uploads/${filename}`
      } catch (e) {
          console.error("Upload error:", e)
          return { success: false, error: "Error al subir la imagen" }
      }
  }

  try {
    // Transaction: Create Assignment AND Update Asset Status
    await prisma.$transaction(async (tx) => {
      // 1. Create Asignacion
      await tx.asignacion.create({
        data: {
          activoId,
          personaId,
          observaciones: observaciones || null,
          hojaAsignacionUrl: hojaUrl || null,
          fechaAsignacion: new Date(),
        },
      })

      // 2. Update Activo Status
      await tx.activo.update({
        where: { id: activoId },
        data: { estado: 'ASIGNADO' },
      })
    })

    revalidatePath('/asignaciones')
    revalidatePath('/activos')
    return { success: true }
  } catch (error) {
    console.error("Error creating assignment:", error)
    return { success: false, error: "Error al crear la asignación" }
  }
}

export async function returnActivoAction(asignacionId: string, activoId: string) {
  const session = await auth();
  if (!hasPermission(session?.user, PERMISSIONS.ASSIGNMENTS.WRITE)) {
      return { success: false, error: "No tienes permisos para devolver activos" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Close Asignacion
      await tx.asignacion.update({
        where: { id: asignacionId },
        data: { fechaDevolucion: new Date() },
      })

      // 2. Free Activo
      await tx.activo.update({
        where: { id: activoId },
        data: { estado: 'DISPONIBLE' },
      })
    })

    revalidatePath('/asignaciones')
    revalidatePath('/activos')
    return { success: true }
  } catch (error) {
    console.error("Error returning asset:", error)
    return { success: false, error: "Error al devolver el activo" }
  }
}
