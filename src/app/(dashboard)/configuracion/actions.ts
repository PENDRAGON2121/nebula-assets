'use server'

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateProfileAction(formData: FormData) {
    const session = await auth()
    
    if (!session?.user?.email) {
        return { success: false, error: "No autorizado" }
    }

    const name = formData.get('name') as string
    const file = formData.get('avatar') as File | null

    if (!name || name.length < 2) {
         return { success: false, error: "El nombre debe tener al menos 2 caracteres" }
    }

    let imageBase64 = undefined;

    if (file && file.size > 0) {
        if (file.size > 2 * 1024 * 1024) { // 2MB limit for DB storage
            return { success: false, error: "La imagen es demasiado grande (máximo 2MB)" }
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            return { success: false, error: "Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, WEBP)." }
        }

        try {
            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)
            const base64String = buffer.toString('base64')
            imageBase64 = `data:${file.type};base64,${base64String}`
        } catch (e) {
            console.error("Image processing error:", e)
            return { success: false, error: "Error al procesar la imagen" }
        }
    }

    const userEmail = session.user.email;
    
    const updateData: any = { name: name };
    if (imageBase64) {
        updateData.image = imageBase64;
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: userEmail }
        });

        if (!user) {
             return { success: false, error: "Usuario no encontrado" }
        }

        await prisma.user.update({
            where: { id: user.id },
            data: updateData
        })

        revalidatePath('/configuracion')
        revalidatePath('/', 'layout') 
        
        return { success: true }
    } catch (error) {
        console.error("Error updating profile:", error)
        return { success: false, error: "Error al actualizar el perfil" }
    }
}
