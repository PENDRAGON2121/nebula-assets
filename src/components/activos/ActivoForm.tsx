'use client'

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createActivoAction, updateActivoAction } from '@/app/(dashboard)/activos/actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activo } from '@prisma/client';

const ActivoSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  codigoInterno: z.string().min(1, "El código interno es obligatorio"),
  serial: z.string().optional(),
  marca: z.string().min(1, "La marca es obligatoria"),
  modelo: z.string().optional(),
  estado: z.enum(["DISPONIBLE", "ASIGNADO", "MANTENIMIENTO", "BAJA"]),
  precioCompra: z.coerce.number().min(0),
  fechaCompra: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Fecha inválida",
  }),
});

interface ActivoFormProps {
  onSuccess?: () => void;
  initialData?: Activo;
}

export function ActivoForm({ onSuccess, initialData }: ActivoFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof ActivoSchema>>({
    resolver: zodResolver(ActivoSchema) as any,
    defaultValues: {
      nombre: initialData?.nombre || '',
      codigoInterno: initialData?.codigoInterno || '',
      serial: initialData?.serial || '',
      marca: initialData?.marca || '',
      modelo: initialData?.modelo || '',
      estado: initialData?.estado || 'DISPONIBLE',
      precioCompra: initialData?.precioCompra ? Number(initialData.precioCompra) : 0,
      fechaCompra: initialData?.fechaCompra 
        ? new Date(initialData.fechaCompra).toISOString().split('T')[0] 
        : new Date().toISOString().split('T')[0],
    },
  });

  async function onSubmit(values: z.infer<typeof ActivoSchema>) {
    setLoading(true);
    try {
      const payload = {
          ...values,
          fechaCompra: new Date(values.fechaCompra)
      };

      let result;
      if (initialData?.id) {
          result = await updateActivoAction(initialData.id, payload as any);
      } else {
          result = await createActivoAction(payload as any);
      }
      
      if (result.success) {
        if (!initialData) form.reset(); // Don't reset if editing, might want to see
        router.refresh();
        if (onSuccess) onSuccess();
      } else {
        console.error(result.error);
        alert("Error al guardar activo: " + JSON.stringify(result.error));
      }
    } catch (e) {
        console.error(e);
        alert("Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Laptop Dell XPS" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="codigoInterno"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Código Interno</FormLabel>
                <FormControl>
                    <Input placeholder="ACT-001" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
            control={form.control}
            name="serial"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Serial</FormLabel>
                <FormControl>
                    <Input placeholder="SN123456" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="marca"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Marca</FormLabel>
                <FormControl>
                    <Input placeholder="Dell" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
            control={form.control}
            name="modelo"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Modelo</FormLabel>
                <FormControl>
                    <Input placeholder="XPS 15" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <div className="grid grid-cols-2 gap-4">
             <FormField
            control={form.control}
            name="precioCompra"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Precio Compra</FormLabel>
                <FormControl>
                    <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
            control={form.control}
            name="fechaCompra"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Fecha Compra</FormLabel>
                <FormControl>
                    <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <FormField
          control={form.control}
          name="estado"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="DISPONIBLE">Disponible</SelectItem>
                  <SelectItem value="ASIGNADO">Asignado</SelectItem>
                  <SelectItem value="MANTENIMIENTO">Mantenimiento</SelectItem>
                  <SelectItem value="BAJA">Baja</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Guardando..." : (initialData ? "Actualizar Activo" : "Guardar Activo")}
        </Button>
      </form>
    </Form>
  );
}
