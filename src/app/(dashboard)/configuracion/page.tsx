import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { ThemeSelector } from "@/components/configuracion/ThemeSelector";

export default async function ConfiguracionPage() {
  const session = await auth();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Configuración</h3>
        <p className="text-sm text-muted-foreground">
          Administra tu cuenta y las preferencias del sistema.
        </p>
      </div>
      <Separator />
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Perfil de Usuario</CardTitle>
            <CardDescription>Información de tu cuenta actual.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={session?.user?.name || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={session?.user?.email || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <Input value="Administrador" disabled />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferencias de la Aplicación</CardTitle>
            <CardDescription>Ajustes generales del sistema.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Apariencia</Label>
                <p className="text-sm text-muted-foreground">
                  Personaliza el tema de la interfaz.
                </p>
              </div>
              <ThemeSelector />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Notificaciones</Label>
                <p className="text-sm text-muted-foreground">
                  Recibir alertas por correo electrónico.
                </p>
              </div>
               <Button variant="outline" disabled>Activado</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
