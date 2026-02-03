import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function PersonaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const persona = await prisma.persona.findUnique({
    where: { id },
    include: {
      asignaciones: {
        include: {
          activo: true
        },
        orderBy: {
            createdAt: 'desc'
        }
      }
    }
  });

  if (!persona) return <div>Persona no encontrada</div>;

  return (
    <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
             <h1 className="text-3xl font-bold tracking-tight">{persona.nombre}</h1>
             <Button variant="outline" asChild>
                 <Link href="/personas">Volver</Link>
             </Button>
        </div>
     
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{persona.departamento}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cargo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{persona.cargo || 'N/A'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate" title={persona.email}>{persona.email}</div>
          </CardContent>
        </Card>
        <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado</CardTitle>
          </CardHeader>
           <CardContent>
               <Badge variant={persona.activo ? "default" : "destructive"}>
                   {persona.activo ? "Activo" : "Inactivo"}
               </Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Asignaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activo</TableHead>
                <TableHead>Serial</TableHead>
                <TableHead>Fecha Asignación</TableHead>
                <TableHead>Fecha Devolución</TableHead>
                <TableHead>Hoja de Asignación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {persona.asignaciones.map((asignacion) => (
                <TableRow key={asignacion.id}>
                  <TableCell className="font-medium">
                    <Link href={`/activos/${asignacion.activo.id}`} className="hover:underline text-primary flex items-center gap-1">
                        {asignacion.activo.nombre} <ExternalLink className="h-3 w-3" />
                    </Link>
                  </TableCell>
                  <TableCell>{asignacion.activo.serial || 'N/A'}</TableCell>
                  <TableCell>
                    {format(new Date(asignacion.fechaAsignacion), "dd/MM/yyyy", { locale: es })}
                  </TableCell>
                  <TableCell>
                    {asignacion.fechaDevolucion 
                        ? format(new Date(asignacion.fechaDevolucion), "dd/MM/yyyy", { locale: es })
                        : <Badge variant="secondary">En Posesión</Badge>
                    }
                  </TableCell>
                  <TableCell>
                    {asignacion.hojaAsignacionUrl ? (
                         <a 
                            href={asignacion.hojaAsignacionUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-blue-600 hover:underline"
                        >
                            <FileText className="h-4 w-4" /> Ver Documento
                        </a>
                    ) : (
                        <span className="text-muted-foreground text-sm">No adjunto</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {persona.asignaciones.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    No hay asignaciones registradas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
