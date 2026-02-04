'use client'

import { useState } from "react"
import { Role, Permission } from "@prisma/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { updateRolePermissions } from "@/app/(dashboard)/usuarios/actions"

type RoleWithPermissions = Role & { permissions: Permission[] }

interface Props {
    initialRoles: RoleWithPermissions[]
    allPermissions: Permission[]
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
            alert("Permisos actualizados")
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
        <div className="grid gap-6 md:grid-cols-2">
            {roles.map(role => (
                <Card key={role.id}>
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>{role.name}</span>
                            <Button 
                                size="sm" 
                                onClick={() => handleSave(role.id)}
                                disabled={loading === role.id}
                            >
                                {loading === role.id ? "Guardando..." : "Guardar Cambios"}
                            </Button>
                        </CardTitle>
                        <CardDescription>{role.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4">
                            {Object.entries(permissionsByModule).map(([module, perms]) => (
                                <div key={module} className="border p-4 rounded-md">
                                    <h3 className="font-semibold capitalize mb-3">{module}</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {perms.map(p => {
                                            const isChecked = role.permissions.some(rp => rp.id === p.id)
                                            return (
                                                <div key={p.id} className="flex items-center space-x-2">
                                                    <input 
                                                        type="checkbox"
                                                        id={`${role.id}-${p.id}`} 
                                                        checked={isChecked}
                                                        onChange={(e) => handleToggle(role.id, p.id, e.target.checked)}
                                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                                    />
                                                    <Label htmlFor={`${role.id}-${p.id}`} className="text-sm cursor-pointer">
                                                        {p.name.split(':')[1] || p.name}
                                                    </Label>
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
