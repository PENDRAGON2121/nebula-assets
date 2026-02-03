import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/components/personas/columns";
import prisma from "@/lib/prisma";
import { AddPersonaButton } from "@/components/personas/AddPersonaButton";

export default async function PersonasPage() {
  const personas = await prisma.persona.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Directorio de Personas</h1>
        <AddPersonaButton />
      </div>
      <DataTable columns={columns} data={personas} />
    </div>
  )
}
