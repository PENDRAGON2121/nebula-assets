import { DataTable } from "@/components/ui/data-table"
import { columns } from "@/components/usuarios/columns"
import { getUsers } from "./actions"
import { auth } from "@/lib/auth"
import { AddUserButton } from "@/components/usuarios/AddUserButton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert } from "lucide-react"

export default async function UsuariosPage() {
  const session = await auth()
  
  if (session?.user?.role !== 'ADMIN') {
      return (
          <div className="flex flex-col items-center justify-center h-[50vh] gap-4 text-center">
              <ShieldAlert className="h-16 w-16 text-destructive" />
              <div>
                  <h1 className="text-2xl font-bold">Acceso Restringido</h1>
                  <p className="text-muted-foreground">Solo los administradores pueden gestionar usuarios.</p>
              </div>
          </div>
      )
  }

  const users = await getUsers()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Gestión de Usuarios</h1>
        <AddUserButton />
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
