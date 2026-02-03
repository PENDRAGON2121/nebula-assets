'use client'

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MantenimientoForm } from "@/components/mantenimientos/MantenimientoForm";
import { useState } from "react";
import { Activo } from "@prisma/client";

export function AddMantenimientoButton({ activosDisponibles }: { activosDisponibles: Activo[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Registrar Mantenimiento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nuevo Mantenimiento</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <MantenimientoForm 
            activosDisponibles={activosDisponibles} 
            onSuccess={() => setOpen(false)} 
           />
        </div>
      </DialogContent>
    </Dialog>
  )
}
