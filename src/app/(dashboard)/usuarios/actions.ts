'use server'

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import bcrypt from "bcryptjs"

const UserSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional(),
  roleId: z.string().min(1, "El rol es requerido"),
})

export async function getRoles() {
    const session = await auth()
    // Authorization check - only ADMIN can see roles list for assignment
    if (session?.user?.role !== 'ADMIN') return []
    return await prisma.role.findMany({
        orderBy: { name: 'asc' }
    })
}

export async function getUsers() {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') return []
    
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            role: true
        }
    })
    
    // Transform for UI consumption - keeping 'role' as string name for backward compat
    return users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        createdAt: user.createdAt,
        role: user.role?.name || 'N/A', // Display name
        roleId: user.roleId || '' // ID for editing
    }))
}

export async function createUser(data: z.infer<typeof UserSchema>) {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
        return { success: false, error: "No tienes permisos para realizar esta acción" }
    }

    const result = UserSchema.safeParse(data)
    if (!result.success) {
        return { success: false, error: "Datos inválidos" }
    }

    if (!data.password) {
        return { success: false, error: "La contraseña es obligatoria para nuevos usuarios" }
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { email: data.email } })
        if (existingUser) {
            return { success: false, error: "El email ya está registrado" }
        }

        const hashedPassword = await bcrypt.hash(data.password, 10)

        await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                roleId: data.roleId,
                image: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random`
            }
        })

        revalidatePath('/usuarios')
        return { success: true }
    } catch (error) {
        console.error("Error creating user:", error)
        return { success: false, error: "Error al crear el usuario" }
    }
}

export async function updateUser(id: string, data: Partial<z.infer<typeof UserSchema>>) {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
        return { success: false, error: "No tienes permisos" }
    }

    try {
        const updateData: any = {
            name: data.name,
            email: data.email,
            roleId: data.roleId
        }

        if (data.password && data.password.length >= 6) {
            updateData.password = await bcrypt.hash(data.password, 10)
        }

        await prisma.user.update({
            where: { id },
            data: updateData
        })

        revalidatePath('/usuarios')
        return { success: true }
    } catch (error) {
        console.error("Error updating user:", error)
        return { success: false, error: "Error al actualizar usuario" }
    }
}

export async function deleteUser(id: string) {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
        return { success: false, error: "No tienes permisos" }
    }

    if (session.user.id === id) {
        return { success: false, error: "No puedes eliminar tu propio usuario" }
    }

    try {
        await prisma.user.delete({ where: { id } })
        revalidatePath('/usuarios')
        return { success: true }
    } catch (error) {
        console.error("Error deleting user:", error)
        return { success: false, error: "Error al eliminar usuario" }
    }
}

export async function updateRolePermissions(roleId: string, permissionIds: string[]) {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') return { success: false, error: "Unauthorized" }

    try {
        await prisma.role.update({
            where: { id: roleId },
            data: {
                permissions: {
                    set: permissionIds.map(id => ({ id }))
                }
            }
        })
        revalidatePath('/usuarios/roles')
        return { success: true }
    } catch (e) {
        console.error(e)
        return { success: false, error: "Failed to update permissions" }
    }
}
