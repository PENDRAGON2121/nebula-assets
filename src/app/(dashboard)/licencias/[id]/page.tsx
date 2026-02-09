import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { KeyRound, Calendar, DollarSign, Users, RefreshCw, Bell } from "lucide-react";

const estadoVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ACTIVA: 'default',
  POR_RENOVAR: 'secondary',
  EXPIRADA: 'destructive',
  CANCELADA: 'outline',
};

const estadoLabels: Record<string, string> = {
  ACTIVA: 'Activa',
  EXPIRADA: 'Expirada',
  POR_RENOVAR: 'Por Renovar',
  CANCELADA: 'Cancelada',
};

const tipoLabels: Record<string, string> = {
  PERPETUA: 'Perpetua',
  SUSCRIPCION: 'Suscripción',
  PRUEBA: 'Prueba',
  OEM: 'OEM',
};

export default async function LicenciaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const licencia = await prisma.licencia.findUnique({
    where: { id },
  });

  if (!licencia) {
    notFound();
  }

  const disponibles = licencia.cantidadTotal - licencia.cantidadAsignada;
  const porcentajeUso = licencia.cantidadTotal > 0
    ? Math.round((licencia.cantidadAsignada / licencia.cantidadTotal) * 100)
    : 0;

  // Calcular días para expiración
  let diasParaExpirar: number | null = null;
  if (licencia.fechaExpiracion) {
    const diff = new Date(licencia.fechaExpiracion).getTime() - new Date().getTime();
    diasParaExpirar = Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <KeyRound className="h-8 w-8 text-muted-foreground" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{licencia.nombre}</h1>
            <p className="text-muted-foreground">{licencia.proveedor}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant={estadoVariant[licencia.estado] || 'outline'}>
            {estadoLabels[licencia.estado] || licencia.estado}
          </Badge>
          <Badge variant="outline">{tipoLabels[licencia.tipoLicencia] || licencia.tipoLicencia}</Badge>
          {licencia.autoRenovacion && (
            <Badge variant="outline" className="gap-1">
              <RefreshCw className="h-3 w-3" /> Auto-renovación
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Uso de Licencias */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Uso de Licencias
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold">{licencia.cantidadTotal}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-600">{licencia.cantidadAsignada}</p>
                  <p className="text-sm text-muted-foreground">Asignadas</p>
                </div>
                <div>
                  <p className={`text-3xl font-bold ${disponibles === 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {disponibles}
                  </p>
                  <p className="text-sm text-muted-foreground">Disponibles</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Utilización</span>
                  <span className="font-medium">{porcentajeUso}%</span>
                </div>
                <div className="h-3 w-full rounded-full bg-muted">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      porcentajeUso >= 90 ? 'bg-red-500' :
                      porcentajeUso >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(porcentajeUso, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información General */}
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Proveedor</h4>
                <p>{licencia.proveedor}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Tipo de Licencia</h4>
                <p>{tipoLabels[licencia.tipoLicencia] || licencia.tipoLicencia}</p>
              </div>
              {licencia.claveProducto && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Clave de Producto</h4>
                  <p className="font-mono text-sm">{licencia.claveProducto}</p>
                </div>
              )}
              {licencia.notas && (
                <div className="md:col-span-2">
                  <h4 className="font-semibold text-sm text-muted-foreground">Notas</h4>
                  <p className="text-sm">{licencia.notas}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Fechas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Fechas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Fecha de Compra</h4>
                <p>{new Date(licencia.fechaCompra).toLocaleDateString()}</p>
              </div>
              {licencia.fechaExpiracion ? (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Fecha de Expiración</h4>
                  <p className={diasParaExpirar !== null && diasParaExpirar < 0 ? 'text-red-600 font-semibold' : ''}>
                    {new Date(licencia.fechaExpiracion).toLocaleDateString()}
                  </p>
                  {diasParaExpirar !== null && (
                    <p className={`text-sm mt-1 ${
                      diasParaExpirar < 0 ? 'text-red-600' :
                      diasParaExpirar <= 30 ? 'text-yellow-600' : 'text-muted-foreground'
                    }`}>
                      {diasParaExpirar < 0
                        ? `Venció hace ${Math.abs(diasParaExpirar)} días`
                        : diasParaExpirar === 0
                        ? 'Vence hoy'
                        : `Vence en ${diasParaExpirar} días`
                      }
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Expiración</h4>
                  <p className="text-muted-foreground">Sin expiración (Perpetua)</p>
                </div>
              )}
              <Separator />
              <div className="flex items-center gap-2">
                <RefreshCw className={`h-4 w-4 ${licencia.autoRenovacion ? 'text-green-600' : 'text-muted-foreground'}`} />
                <span className="text-sm">
                  Auto-renovación: {licencia.autoRenovacion ? 'Sí' : 'No'}
                </span>
              </div>
              {licencia.diasNotificacion && (
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Notificar {licencia.diasNotificacion} días antes
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Costos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Costos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Costo Unitario</h4>
                <p className="text-lg font-semibold">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(licencia.costoUnitario))}
                </p>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Costo Total</h4>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(licencia.costoTotal))}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
