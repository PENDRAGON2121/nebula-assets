import { StatsCards } from "@/components/dashboard/StatsCards";
import { StatsCardsSkeleton } from "@/components/dashboard/StatsCardsSkeleton";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Overview } from "@/components/dashboard/Overview";
import { RecentAssignments } from "@/components/dashboard/RecentAssignments";
import prisma from "@/lib/prisma";
import { subDays, format } from "date-fns";
import { es } from "date-fns/locale";

// Fetch Chart Data: Assignments per day in last 7 days
async function getChartData() {
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = subDays(today, 6 - i);
        return {
            date: d,
            label: format(d, "EEE", { locale: es }), // Mon, Tue, Wed...
            count: 0
        };
    });

    // Get assignments from DB
    const startDate = subDays(today, 7);
    const assignments = await prisma.asignacion.findMany({
        where: {
            createdAt: {
                gte: startDate
            }
        },
        select: {
            createdAt: true
        }
    });

    // Aggregate
    assignments.forEach(a => {
        const dayStr = format(a.createdAt, "EEE", { locale: es });
        const dayItem = last7Days.find(d => d.label === dayStr);
        if (dayItem) dayItem.count++;
    });

    return last7Days.map(d => ({ name: d.label.charAt(0).toUpperCase() + d.label.slice(1), total: d.count }));
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

    // Serialize to plain JSON to avoid "object is not extensible" and Decimal issues
    return JSON.parse(JSON.stringify(data));
}

export default async function DashboardPage() {
  const chartData = await getChartData();
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
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Asignaciones realizadas en los últimos 7 días.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview data={chartData} />
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
