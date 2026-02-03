import { StatsCards } from "@/components/dashboard/StatsCards";
import { StatsCardsSkeleton } from "@/components/dashboard/StatsCardsSkeleton";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AssetStatusChart } from "@/components/dashboard/AssetStatusChart";
import { RecentAssignments } from "@/components/dashboard/RecentAssignments";
import prisma from "@/lib/prisma";
import { toJSON } from "@/lib/utils";

export const dynamic = 'force-dynamic';

async function getAssetStatusData() {
    const statusCounts = await prisma.activo.groupBy({
        by: ['estado'],
        _count: {
            estado: true
        }
    });

    // Transform to chart format with colors
    const colors: Record<string, string> = {
        'DISPONIBLE': '#22c55e', // green-500
        'ASIGNADO': '#3b82f6', // blue-500
        'MANTENIMIENTO': '#eab308', // yellow-500
        'BAJA': '#ef4444' // red-500
    };

    return statusCounts.map(item => ({
        name: item.estado,
        value: item._count.estado,
        color: colors[item.estado] || '#94a3b8'
    }));
}

async function getRecentAssignments() {
    const data = await prisma.asignacion.findMany({
        take: 5,
        orderBy: {
            fechaAsignacion: 'desc'
        },
        include: {
            persona: true,
            activo: true
        }
    });

    // Serialize to plain JSON
    return toJSON(data);
}

export default async function DashboardPage() {
  const statusData = await getAssetStatusData();
  const recentAssignments = await getRecentAssignments();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      
      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCards />
      </Suspense>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Estado del Inventario</CardTitle>
            <CardDescription>Distribución de activos por estado actual.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <AssetStatusChart data={statusData} />
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Últimas Asignaciones</CardTitle>
            <CardDescription>Empleados que recibieron equipos recientemente.</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentAssignments asignaciones={recentAssignments} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
