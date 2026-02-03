'use client'

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { finishMantenimientoAction } from '@/app/(dashboard)/mantenimientos/actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const FinishSchema = z.object({
  costo: z.coerce.number().min(0, "Costo inválido"),
  fechaFin: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Fecha inválida",
  }),
});

interface FinishMantenimientoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mantenimientoId: string;
  activoId: string;
}

export function FinishMantenimientoDialog({ isOpen, onClose, mantenimientoId, activoId }: FinishMantenimientoDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof FinishSchema>>({
    resolver: zodResolver(FinishSchema) as any,
    defaultValues: {
      costo: 0,
      fechaFin: new Date().toISOString().split('T')[0],
    },
  });

  async function onSubmit(values: z.infer<typeof FinishSchema>) {
    setLoading(true);
    try {
      const result = await finishMantenimientoAction({
        mantenimientoId,
        activoId,
        costo: Number(values.costo),
        fechaFin: new Date(values.fechaFin),
      });

      if (result.success) {
        form.reset();
        router.refresh();
        onClose();
      } else {
        alert("Error: " + JSON.stringify(result.error));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Finalizar Mantenimiento</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="costo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Costo Final ($)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fechaFin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha Finalización</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : "Confirmar"}
                </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
