'use client'

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createRole } from '@/app/(dashboard)/usuarios/actions';

const RoleFormSchema = z.object({
  name: z.string()
    .min(2, "El nombre del rol debe tener al menos 2 caracteres")
    .regex(/^[A-Z_]+$/, "El nombre debe ser mayúsculas y guiones bajos (ej: MANAGER, SUPER_USER)"),
  description: z.string().optional()
});

interface AddRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddRoleDialog({ isOpen, onClose }: AddRoleDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof RoleFormSchema>>({
    resolver: zodResolver(RoleFormSchema),
    defaultValues: {
      name: '',
      description: ''
    },
  });

  async function onSubmit(values: z.infer<typeof RoleFormSchema>) {
    setLoading(true);
    try {
      const result = await createRole(values);

      if (result.success) {
        form.reset();
        onClose();
        router.refresh();
      } else {
        // Handle array of errors or simple string
        const errorMsg = typeof result.error === 'string' 
            ? result.error 
            : "Error validando datos";
        alert("Error: " + errorMsg);
      }
    } catch (e) {
        console.error(e)
        alert("Error inesperado")
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nuevo Rol</DialogTitle>
          <DialogDescription>
            Crea un nuevo rol de sistema. El nombre debe ser único, en mayúsculas y usar guiones bajos en lugar de espacios.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Rol (ID)</FormLabel>
                  <FormControl>
                    <Input placeholder="SUPER_USER" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
                  </FormControl>
                  <FormDescription>
                    Ej: FINANCE_MANAGER
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input placeholder="Descripción opcional del rol..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creando..." : "Crear Rol"}
                </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
