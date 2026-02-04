import { DataTable } from "@/components/ui/data-table"
import { columns } from "@/components/usuarios/columns"
import { getUsers } from "./actions"
import { auth, signOut } from "@/lib/auth"
import { AddUserButton } from "@/components/usuarios/AddUserButton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { hasPermission } from "@/lib/rbac"
import { PERMISSIONS } from "@/config/permissions"

export default async function UsuariosPage() {
  const session = await auth()
  
  const canReadUsers = hasPermission(session?.user, PERMISSIONS.USERS.READ);
  
  if (!canReadUsers) {
      // Fallback check for session sync issues
      if (session?.user?.email) {
          const user = await prisma.user.findUnique({
              where: { email: session.user.email },
              include: { role: { include: { permissions: true } } }
          })
          
          // Check if DB user has permission but session doesn't
          const dbHasPermission = user?.role?.name === 'ADMIN' || 
                                  user?.role?.permissions.some(p => p.name === PERMISSIONS.USERS.READ);
                                  
          if (dbHasPermission) {
              return (
                <div className="flex flex-col items-center justify-center h-[50vh] gap-4 text-center">
                    <ShieldAlert className="h-16 w-16 text-yellow-500" />
                    <div>
                        <h1 className="text-2xl font-bold">Sesión Desactualizada</h1>
                        <p className="text-muted-foreground mb-4">Tus permisos han sido actualizados. Por favor, inicia sesión nuevamente para aplicar los cambios.</p>
                        
                        <form action={async () => {
                          "use server"
                          await signOut()
                        }}>
                          <Button variant="default">
                            <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión e Ingresar
                          </Button>
                        </form>
                    </div>
                </div>
            )
          }
      }

      return (
          <div className="flex flex-col items-center justify-center h-[50vh] gap-4 text-center">
              <ShieldAlert className="h-16 w-16 text-destructive" />
              <div>
                  <h1 className="text-2xl font-bold">Acceso Restringido</h1>
                  <p className="text-muted-foreground">No tienes permisos para ver el listado de usuarios.</p>
              </div>
          </div>
      )
  }

  const users = await getUsers()
  const canManageRoles = session?.user?.role === 'ADMIN'; 
  const canCreateUser = hasPermission(session?.user, PERMISSIONS.USERS.WRITE);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Gestión de Usuarios</h1>
        <div className="flex gap-2">
            {canManageRoles && (
                <Link href="/usuarios/roles">
                    <Button variant="outline">Gestionar Roles</Button>
                </Link>
            )}
            {canCreateUser && <AddUserButton />}
        </div>
      </div>
      
      <Card>
          <CardHeader>
              <CardTitle>Usuarios del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
             <DataTable columns={columns} data={users} />
          </CardContent>
      </Card>
    </div>
  )
}
