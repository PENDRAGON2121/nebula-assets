'use client'

import { useState } from "react"
import { Role, Permission } from "@prisma/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { updateRolePermissions } from "@/app/(dashboard)/usuarios/actions"
import { Check, Loader2, Save } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type RoleWithPermissions = Role & { permissions: Permission[] }

interface Props {
    initialRoles: RoleWithPermissions[]
    allPermissions: Permission[]
}

const MODULE_LABELS: Record<string, string> = {
    'users': 'Gestión de Usuarios',
    'assets': 'Inventario de Activos',
    'people': 'Gestión de Personas',
    'maintenance': 'Mantenimientos',
    'assignments': 'Asignaciones',
    'reports': 'Reportes',
    'settings': 'Configuración'
}

const ACTION_LABELS: Record<string, string> = {
    'read': 'Ver / Leer',
    'write': 'Crear / Editar',
    'delete': 'Eliminar'
}

export function RolePermissionsEditor({ initialRoles, allPermissions }: Props) {
    const [roles, setRoles] = useState(initialRoles)
    const [loading, setLoading] = useState<string | null>(null)

    const handleToggle = (roleId: string, permissionId: string, checked: boolean) => {
        const updatedRoles = roles.map(r => {
            if (r.id !== roleId) return r;
            if (checked) {
                const p = allPermissions.find(p => p.id === permissionId)!;
                return { ...r, permissions: [...r.permissions, p] };
            } else {
                return { ...r, permissions: r.permissions.filter(p => p.id !== permissionId) };
            }
        })
        setRoles(updatedRoles)
    }

    const handleSave = async (roleId: string) => {
        setLoading(roleId)
        const role = roles.find(r => r.id === roleId)
        if (!role) return;

        const permissionIds = role.permissions.map(p => p.id)
        const res = await updateRolePermissions(roleId, permissionIds)
        
        setLoading(null)
        if (res.success) {
            // Optional: Show toast
        } else {
            alert("Error: " + res.error)
        }
    }

    const permissionsByModule = allPermissions.reduce((acc, p) => {
        const module = p.name.split(':')[0]
        if (!acc[module]) acc[module] = []
        acc[module].push(p)
        return acc
    }, {} as Record<string, Permission[]>)

    return (
        <div className="space-y-8">
            {roles.map(role => (
                <Card key={role.id} className="overflow-hidden border-t-4 border-t-primary/20">
                    <CardHeader className="bg-muted/30 pb-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    {role.name}
                                    {role.name === 'ADMIN' && <Badge variant="secondary">Sistema</Badge>}
                                </CardTitle>
                                <CardDescription className="mt-1">{role.description}</CardDescription>
                            </div>
                            <Button 
                                onClick={() => handleSave(role.id)}
                                disabled={loading === role.id}
                                className="min-w-[140px]"
                            >
                                {loading === role.id ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
                                ) : (
                                    <><Save className="mr-2 h-4 w-4" /> Guardar Cambios</>
                                )}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {Object.entries(permissionsByModule).map(([module, perms]) => (
                                <div key={module} className="border rounded-lg overflow-hidden bg-card text-card-foreground shadow-sm">
                                    <div className="px-4 py-3 bg-muted/50 border-b font-medium text-sm flex items-center justify-between">
                                        <span className="font-semibold text-primary">
                                            {MODULE_LABELS[module] || module.charAt(0).toUpperCase() + module.slice(1)}
                                        </span>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        {perms.map(p => {
                                            const isChecked = role.permissions.some(rp => rp.id === p.id)
                                            const action = p.name.split(':')[1]
                                            return (
                                                <div key={p.id} className="flex items-start space-x-3 group">
                                                    <div className="flex h-5 items-center">
                                                        <input 
                                                            type="checkbox"
                                                            id={`${role.id}-${p.id}`} 
                                                            checked={isChecked}
                                                            onChange={(e) => handleToggle(role.id, p.id, e.target.checked)}
                                                            disabled={role.name === 'ADMIN'} // Optional: Lock admin permissions to avoid lockout
                                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer disabled:opacity-50"
                                                        />
                                                    </div>
                                                    <div className="text-sm">
                                                        <Label 
                                                            htmlFor={`${role.id}-${p.id}`} 
                                                            className={`font-normal cursor-pointer ${role.name === 'ADMIN' ? 'cursor-not-allowed opacity-70' : ''}`}
                                                        >
                                                            {ACTION_LABELS[action] || action}
                                                        </Label>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
