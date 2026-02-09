import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/components/licencias/columns";
import prisma from "@/lib/prisma";
import { AddLicenciaButton } from "@/components/licencias/AddLicenciaButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

export default async function LicenciasPage() {
  const data = await prisma.licencia.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const licencias = data.map((lic) => ({
    ...lic,
    costoUnitario: lic.costoUnitario.toNumber(),
    costoTotal: lic.costoTotal.toNumber(),
  }));

  // Stats
  const totalLicencias = licencias.reduce((acc, l) => acc + l.cantidadTotal, 0);
  const totalAsignadas = licencias.reduce((acc, l) => acc + l.cantidadAsignada, 0);
  const totalDisponibles = totalLicencias - totalAsignadas;
  const activas = licencias.filter(l => l.estado === 'ACTIVA').length;
  const porRenovar = licencias.filter(l => l.estado === 'POR_RENOVAR').length;
  const expiradas = licencias.filter(l => l.estado === 'EXPIRADA').length;

  // Licencias próximas a expirar (30 días)
  const now = new Date();
  const proximasAExpirar = licencias.filter(l => {
    if (!l.fechaExpiracion || l.estado === 'EXPIRADA' || l.estado === 'CANCELADA') return false;
    const diff = new Date(l.fechaExpiracion).getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days >= 0 && days <= 30;
  }).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Gestión de Licencias</h1>
        <AddLicenciaButton />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Licencias</CardTitle>
            <KeyRound className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLicencias}</div>
            <p className="text-xs text-muted-foreground">
              {licencias.length} productos registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponibles</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalDisponibles}</div>
            <p className="text-xs text-muted-foreground">
              {totalAsignadas} asignadas de {totalLicencias}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Por Renovar</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{porRenovar}</div>
            <p className="text-xs text-muted-foreground">
              {proximasAExpirar > 0 ? `${proximasAExpirar} expiran en 30 días` : 'Sin urgencias'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiradas</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{expiradas}</div>
            <p className="text-xs text-muted-foreground">
              {activas} activas actualmente
            </p>
          </CardContent>
        </Card>
      </div>

      <DataTable columns={columns} data={licencias as any} />
    </div>
  )
}
