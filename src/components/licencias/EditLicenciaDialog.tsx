'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LicenciaForm } from "@/components/licencias/LicenciaForm";
import { Licencia } from "@prisma/client";

interface EditLicenciaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  licencia: Licencia;
}

export function EditLicenciaDialog({ open, onOpenChange, licencia }: EditLicenciaDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Licencia</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <LicenciaForm
            initialData={licencia}
            onSuccess={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
