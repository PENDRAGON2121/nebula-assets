'use client'

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createMantenimientoAction } from '@/app/(dashboard)/mantenimientos/actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activo } from '@prisma/client';

const MantenimientoSchema = z.object({
  activoId: z.string().min(1, "Activo requerido"),
  tipo: z.enum(["PREVENTIVO", "CORRECTIVO"]),
  descripcion: z.string().min(1, "Descripción requerida"),
  realizadoPor: z.string().optional(),
  fechaInicio: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Fecha inválida",
  }),
});

interface MantenimientoFormProps {
  activosDisponibles: Activo[];
  onSuccess?: () => void;
}

export function MantenimientoForm({ activosDisponibles, onSuccess }: MantenimientoFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof MantenimientoSchema>>({
    resolver: zodResolver(MantenimientoSchema),
    defaultValues: {
      activoId: '',
      tipo: 'PREVENTIVO',
      descripcion: '',
      realizadoPor: '',
      fechaInicio: new Date().toISOString().split('T')[0],
    },
  });

  async function onSubmit(values: z.infer<typeof MantenimientoSchema>) {
    setLoading(true);
    try {
      const result = await createMantenimientoAction({
        ...values,
        fechaInicio: new Date(values.fechaInicio)
      } as any);
      
      if (result.success) {
        form.reset();
        router.refresh();
        if (onSuccess) onSuccess();
      } else {
        alert("Error: " + JSON.stringify(result.error));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="activoId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Activo (Disponible o Asignado)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar activo..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {activosDisponibles.map((activo) => (
                    <SelectItem key={activo.id} value={activo.id}>
                      {activo.nombre} - {activo.codigoInterno}
                    </SelectItem>
                  ))}
                  {activosDisponibles.length === 0 && <SelectItem value="none" disabled>No hay activos elegibles</SelectItem>}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="tipo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="PREVENTIVO">Preventivo</SelectItem>
                  <SelectItem value="CORRECTIVO">Correctivo</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción del problema/tarea</FormLabel>
              <FormControl>
                <Input placeholder="Limpieza interna de ventiladores..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="realizadoPor"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Proveedor / Técnico</FormLabel>
                <FormControl>
                    <Input placeholder="Soporte Externo S.A." {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
            control={form.control}
            name="fechaInicio"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Fecha Inicio</FormLabel>
                <FormControl>
                    <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <Button type="submit" className="w-full" disabled={loading || activosDisponibles.length === 0}>
          {loading ? "Registrando..." : "Registrar Mantenimiento"}
        </Button>
      </form>
    </Form>
  );
}
