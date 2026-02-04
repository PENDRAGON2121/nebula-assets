'use server'

import prisma from "@/lib/prisma"
import { hash } from "bcryptjs"
import { z } from "zod"

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
})

export async function registerFirstUser(data: z.infer<typeof registerSchema>) {
  const result = registerSchema.safeParse(data)
  if (!result.success) {
    return { success: false, error: "Datos inválidos" }
  }

  try {
    const userCount = await prisma.user.count()

    if (userCount > 0) {
      return { success: false, error: "El sistema ya ha sido inicializado." }
    }

    const hashedPassword = await hash(data.password, 10)

    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: {
          connectOrCreate: {
            where: { name: 'ADMIN' },
            create: { name: 'ADMIN', description: 'Administrator with full access' }
          }
        },
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, error: "Error al registrar el usuario" }
  }
}

export async function checkHasUsers() {
    const count = await prisma.user.count()
    return count > 0
}
