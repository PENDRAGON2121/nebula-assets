'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ActivoForm } from "@/components/activos/ActivoForm";
import { Activo } from "@prisma/client";

interface EditActivoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activo: Activo;
}

export function EditActivoDialog({ open, onOpenChange, activo }: EditActivoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Activo</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <ActivoForm 
            initialData={activo} 
            onSuccess={() => onOpenChange(false)} 
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
