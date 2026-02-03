'use server'

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

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

    let imageUrl = undefined;

    if (file && file.size > 0) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            return { success: false, error: "La imagen es demasiado grande (máximo 5MB)" }
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            return { success: false, error: "Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, WEBP)." }
        }

        try {
            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)

            // Create unique filename
            // Sanitize email for filename
            const safeEmail = session.user.email.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const filename = `avatar-${safeEmail}-${Date.now()}.${file.name.split('.').pop()}`
            const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars')
            
            // Ensure dir exists
            await mkdir(uploadDir, { recursive: true })
            
            const filepath = join(uploadDir, filename)
            await writeFile(filepath, buffer)
            
            imageUrl = `/uploads/avatars/${filename}`
        } catch (e) {
            console.error("Upload error:", e)
            return { success: false, error: "Error al subir la imagen" }
        }
    }

    const userEmail = session.user.email;
    
    // Explicitly construct the data object to avoid potential issues with spreading undefined
    const updateData: any = { name: name };
    if (imageUrl) {
        updateData.image = imageUrl;
    }

    try {
        // First find the user to ensure we have the ID and they exist
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
        // We might need to revalidate root or other places where avatar is shown
        revalidatePath('/', 'layout') 
        
        return { success: true, image: imageUrl }
    } catch (error) {
        console.error("Error updating profile:", error)
        return { success: false, error: "Error al actualizar el perfil" }
    }
}
