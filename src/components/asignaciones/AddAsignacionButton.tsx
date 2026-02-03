'use client'

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AsignacionForm } from "@/components/asignaciones/AsignacionForm";
import { useState } from "react";
import { Activo, Persona } from "@prisma/client";

interface AddAsignacionButtonProps {
    activosDisponibles: Activo[];
    personas: Persona[];
}

export function AddAsignacionButton({ activosDisponibles, personas }: AddAsignacionButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Nueva Asignación
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Asignar Activo</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <AsignacionForm 
            activosDisponibles={activosDisponibles} 
            personas={personas}
            onSuccess={() => setOpen(false)} 
           />
        </div>
      </DialogContent>
    </Dialog>
  )
}
