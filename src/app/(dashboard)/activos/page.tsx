import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/components/activos/columns";
import prisma from "@/lib/prisma";
import { AddActivoButton } from "@/components/activos/AddActivoButton";

export default async function ActivosPage() {
  const data = await prisma.activo.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const activos = data.map((activo) => ({
    ...activo,
    precioCompra: activo.precioCompra.toNumber(),
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Inventario de Activos</h1>
        <AddActivoButton />
      </div>
      <DataTable columns={columns} data={activos as any} />
    </div>
  )
}
