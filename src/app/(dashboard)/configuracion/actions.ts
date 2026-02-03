'use server'

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const profileSchema = z.object({
    name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
})

export async function updateProfileAction(data: z.infer<typeof profileSchema>) {
    const session = await auth()
    
    if (!session?.user?.email) {
        return { success: false, error: "No autorizado" }
    }

    const result = profileSchema.safeParse(data)
    if (!result.success) {
        return { success: false, error: "Datos inválidos" }
    }

    try {
        await prisma.user.update({
            where: { email: session.user.email },
            data: { name: data.name }
        })

        revalidatePath('/configuracion')
        return { success: true }
    } catch (error) {
        console.error("Error updating profile:", error)
        return { success: false, error: "Error al actualizar el perfil" }
    }
}
