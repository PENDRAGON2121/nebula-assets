import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { RolePermissionsEditor } from "@/components/usuarios/RolePermissionsEditor"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function RolesPage() {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
        redirect('/usuarios')
    }

    const roles = await prisma.role.findMany({
        include: { permissions: true },
        orderBy: { name: 'asc' }
    })
    
    const allPermissions = await prisma.permission.findMany({ orderBy: { name: 'asc' } })

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Link href="/usuarios">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">Gestión de Roles y Permisos</h1>
            </div>
            
            <RolePermissionsEditor initialRoles={roles} allPermissions={allPermissions} />
        </div>
    )
}
