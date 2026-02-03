import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/components/mantenimientos/columns";
import prisma from "@/lib/prisma";
import { AddMantenimientoButton } from "@/components/mantenimientos/AddMantenimientoButton";

export default async function MantenimientosPage() {
  // 1. Fetch Maintenances
  const data = await prisma.mantenimiento.findMany({
    include: {
      activo: true,
    },
    orderBy: { createdAt: 'desc' }
  });
  
  const mantenimientos = data.map((item) => ({
      ...item,
      costo: item.costo ? item.costo.toNumber() : null,
      activo: {
          ...item.activo,
          precioCompra: item.activo.precioCompra.toNumber()
      }
  }));

  // 2. Fetch Assets Eligible for Maintenance (Available or Assigned - though usually you maintain assigned items too, 
  // but for strict flow let's say we pull them from 'DISPONIBLE' or 'ASIGNADO'. 
  // If it's 'ASIGNADO', does it go to 'MANTENIMIENTO'? Yes.
  // The action handles the state transition to 'MANTENIMIENTO'.
  // We should show all assets that are NOT already in 'MANTENIMIENTO' or 'BAJA'.
  const activosData = await prisma.activo.findMany({
    where: {
        estado: {
            in: ['DISPONIBLE', 'ASIGNADO']
        }
    },
    orderBy: { nombre: 'asc' }
  });

  const activosEligibles = activosData.map((activo) => ({
      ...activo,
      precioCompra: activo.precioCompra.toNumber(),
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Bitácora de Mantenimiento</h1>
        <AddMantenimientoButton activosDisponibles={activosEligibles as any} />
      </div>
      <DataTable columns={columns} data={mantenimientos} />
    </div>
  )
}
