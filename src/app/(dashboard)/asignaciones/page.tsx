import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/components/asignaciones/columns";
import prisma from "@/lib/prisma";
import { AddAsignacionButton } from "@/components/asignaciones/AddAsignacionButton";

export default async function AsignacionesPage() {
  // 1. Fetch Assignments (with relations)
  const data = await prisma.asignacion.findMany({
    include: {
      activo: true,
      persona: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  const asignaciones = data.map((item) => ({
      ...item,
      activo: {
          ...item.activo,
          precioCompra: item.activo.precioCompra.toNumber()
      }
  }));

  // 2. Fetch Available Assets for the Form
  const activosData = await prisma.activo.findMany({
    where: { estado: 'DISPONIBLE' },
    orderBy: { nombre: 'asc' }
  });

  const activosDisponibles = activosData.map((activo) => ({
      ...activo,
      precioCompra: activo.precioCompra.toNumber(),
  }));

  // 3. Fetch Active People
  const personas = await prisma.persona.findMany({
    where: { activo: true },
    orderBy: { nombre: 'asc' }
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Registro de Asignaciones</h1>
        <AddAsignacionButton 
            activosDisponibles={activosDisponibles as any} 
            personas={personas} 
        />
      </div>
      <DataTable columns={columns} data={asignaciones} />
    </div>
  )
}
