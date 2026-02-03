import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { PrintButton } from "@/components/activos/PrintButton";
import { QRCodeDisplay } from "@/components/activos/QRCodeDisplay";

export default async function ActivoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const activo = await prisma.activo.findUnique({
    where: { id },
    include: {
      asignaciones: {
        include: { persona: true },
        orderBy: { fechaAsignacion: 'desc' }
      },
      mantenimientos: {
        orderBy: { fechaInicio: 'desc' }
      }
    }
  });

  if (!activo) {
    notFound();
  }

  // Combine history for timeline
  const history = [
    ...activo.asignaciones.map(a => ({
      type: 'ASIGNACION',
      date: a.fechaAsignacion,
      title: 'Asignación',
      description: `Asignado a ${a.persona.nombre} (${a.persona.departamento})`,
      status: a.fechaDevolucion ? 'Devuelto' : 'Activo',
      details: a.observaciones
    })),
    ...activo.mantenimientos.map(m => ({
      type: 'MANTENIMIENTO',
      date: m.fechaInicio,
      title: `Mantenimiento ${m.tipo}`,
      description: m.descripcion,
      status: m.fechaFin ? 'Finalizado' : 'En Proceso',
      details: m.realizadoPor ? `Realizado por: ${m.realizadoPor}` : undefined
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // URL for QR Code (pointing to this page)
  // In production, this should be the full domain. Using window.location in client or env var in server.
  // We'll use a placeholder base URL or relative path if scanned within app context, 
  // but usually scanners need absolute URL.
  // Assuming localhost for dev, but ideally use process.env.NEXT_PUBLIC_APP_URL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const qrValue = `${appUrl}/activos/${id}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{activo.nombre}</h1>
          <p className="text-muted-foreground">
            Código: <span className="font-mono font-medium text-foreground">{activo.codigoInterno}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
            <PrintButton />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
            {/* Status Badge */}
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Estado actual:</span>
                <Badge variant={
                    activo.estado === 'DISPONIBLE' ? 'default' : 
                    activo.estado === 'ASIGNADO' ? 'secondary' : 
                    activo.estado === 'MANTENIMIENTO' ? 'destructive' : 'outline'
                }>
                    {activo.estado}
                </Badge>
            </div>

            <Tabs defaultValue="details">
                <TabsList>
                    <TabsTrigger value="details">Detalles</TabsTrigger>
                    <TabsTrigger value="history">Historial ({history.length})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información del Activo</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <div>
                                <h4 className="font-semibold text-sm text-muted-foreground">Marca / Modelo</h4>
                                <p>{activo.marca} {activo.modelo || '-'}</p>
                            </div>
                             <div>
                                <h4 className="font-semibold text-sm text-muted-foreground">Serial</h4>
                                <p className="font-mono">{activo.serial || 'N/A'}</p>
                            </div>
                             <div>
                                <h4 className="font-semibold text-sm text-muted-foreground">Fecha Compra</h4>
                                <p>{activo.fechaCompra.toLocaleDateString()}</p>
                            </div>
                             <div>
                                <h4 className="font-semibold text-sm text-muted-foreground">Precio Compra</h4>
                                <p>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(activo.precioCompra))}</p>
                            </div>
                             <div>
                                <h4 className="font-semibold text-sm text-muted-foreground">Vida Útil Estimada</h4>
                                <p>{activo.vidaUtilMeses ? `${activo.vidaUtilMeses} meses` : 'No definida'}</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history">
                     <Card>
                        <CardHeader>
                            <CardTitle>Línea de Tiempo</CardTitle>
                            <CardDescription>Movimientos y mantenimientos registrados.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">
                                {history.length === 0 && <p className="text-muted-foreground text-sm">No hay historial disponible.</p>}
                                {history.map((item, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-2 h-2 rounded-full mt-2 ${item.type === 'ASIGNACION' ? 'bg-blue-500' : 'bg-orange-500'}`} />
                                            {i !== history.length - 1 && <div className="w-px h-full bg-border my-1" />}
                                        </div>
                                        <div className="pb-8">
                                            <p className="text-sm text-muted-foreground">{new Date(item.date).toLocaleDateString()}</p>
                                            <h4 className="font-medium">{item.title}</h4>
                                            <p className="text-sm">{item.description}</p>
                                            {item.details && <p className="text-xs text-muted-foreground mt-1">{item.details}</p>}
                                            <Badge variant="outline" className="mt-2 text-[10px]">{item.status}</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>

        {/* Sidebar / QR */}
        <div className="space-y-6">
            <Card className="print:shadow-none print:border-none">
                <CardHeader>
                    <CardTitle>Etiqueta QR</CardTitle>
                    <CardDescription>Para seguimiento físico.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    <QRCodeDisplay value={qrValue} assetCode={activo.codigoInterno} />
                    <div className="text-center">
                        <p className="font-bold text-lg">{activo.codigoInterno}</p>
                        <p className="text-xs text-muted-foreground text-wrap break-all">{id}</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="print:hidden">
                <CardHeader>
                    <CardTitle>Imagen</CardTitle>
                </CardHeader>
                <CardContent>
                    {activo.imagenUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                            src={activo.imagenUrl} 
                            alt="Activo" 
                            className="w-full h-auto rounded-md object-cover aspect-video bg-muted" 
                        />
                    ) : (
                        <div className="w-full aspect-video bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                            Sin imagen
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
