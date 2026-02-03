'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const PersonaSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().email("Email inválido"),
  departamento: z.string().min(1, "Departamento requerido"),
  cargo: z.string().optional(),
})

export type PersonaFormValues = z.infer<typeof PersonaSchema>

export async function createPersonaAction(data: PersonaFormValues) {
  const validated = PersonaSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, error: validated.error.flatten() };
  }

  try {
    await prisma.persona.create({
      data: validated.data,
    })
    revalidatePath('/personas')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Error al crear persona (¿Email duplicado?)" }
  }
}

export async function deletePersonaAction(id: string) {
  try {
    await prisma.persona.delete({ where: { id } })
    revalidatePath('/personas')
    return { success: true }
  } catch (error) {
    return { success: false, error: "Error al eliminar" }
  }
}
