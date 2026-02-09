'use client'

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { createLicenciaAction, updateLicenciaAction } from '@/app/(dashboard)/licencias/actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Licencia } from '@prisma/client';

const LicenciaSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  proveedor: z.string().min(1, "El proveedor es obligatorio"),
  tipoLicencia: z.enum(["PERPETUA", "SUSCRIPCION", "PRUEBA", "OEM"]),
  estado: z.enum(["ACTIVA", "EXPIRADA", "POR_RENOVAR", "CANCELADA"]),
  claveProducto: z.string().optional(),
  cantidadTotal: z.coerce.number().int().min(1, "Mínimo 1"),
  cantidadAsignada: z.coerce.number().int().min(0),
  fechaCompra: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Fecha inválida" }),
  fechaExpiracion: z.string().optional(),
  costoUnitario: z.coerce.number().min(0),
  costoTotal: z.coerce.number().min(0),
  autoRenovacion: z.boolean().default(false),
  diasNotificacion: z.coerce.number().int().min(0).optional(),
  notas: z.string().optional(),
});

interface LicenciaFormProps {
  onSuccess?: () => void;
  initialData?: Licencia;
}

export function LicenciaForm({ onSuccess, initialData }: LicenciaFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof LicenciaSchema>>({
    resolver: zodResolver(LicenciaSchema) as any,
    defaultValues: {
      nombre: initialData?.nombre || '',
      proveedor: initialData?.proveedor || '',
      tipoLicencia: initialData?.tipoLicencia || 'SUSCRIPCION',
      estado: initialData?.estado || 'ACTIVA',
      claveProducto: initialData?.claveProducto || '',
      cantidadTotal: initialData?.cantidadTotal || 1,
      cantidadAsignada: initialData?.cantidadAsignada || 0,
      fechaCompra: initialData?.fechaCompra
        ? new Date(initialData.fechaCompra).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      fechaExpiracion: initialData?.fechaExpiracion
        ? new Date(initialData.fechaExpiracion).toISOString().split('T')[0]
        : '',
      costoUnitario: initialData?.costoUnitario ? Number(initialData.costoUnitario) : 0,
      costoTotal: initialData?.costoTotal ? Number(initialData.costoTotal) : 0,
      autoRenovacion: initialData?.autoRenovacion || false,
      diasNotificacion: initialData?.diasNotificacion || undefined,
      notas: initialData?.notas || '',
    },
  });

  const tipoLicencia = form.watch('tipoLicencia');
  const cantidadTotal = form.watch('cantidadTotal');
  const costoUnitario = form.watch('costoUnitario');

  // Auto-calculate total cost
  const calculatedTotal = cantidadTotal * costoUnitario;
  if (form.getValues('costoTotal') !== calculatedTotal) {
    form.setValue('costoTotal', calculatedTotal);
  }

  async function onSubmit(values: z.infer<typeof LicenciaSchema>) {
    setLoading(true);
    try {
      const payload = {
        ...values,
        fechaCompra: new Date(values.fechaCompra),
        fechaExpiracion: values.fechaExpiracion ? new Date(values.fechaExpiracion) : null,
        diasNotificacion: values.diasNotificacion || null,
      };

      let result;
      if (initialData?.id) {
        result = await updateLicenciaAction(initialData.id, payload as any);
      } else {
        result = await createLicenciaAction(payload as any);
      }

      if (result.success) {
        if (!initialData) form.reset();
        router.refresh();
        if (onSuccess) onSuccess();
      } else {
        console.error(result.error);
        alert("Error al guardar licencia: " + JSON.stringify(result.error));
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
              <FormLabel>Nombre del Software / Servicio</FormLabel>
              <FormControl>
                <Input placeholder="Microsoft 365 Business" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="proveedor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Proveedor</FormLabel>
                <FormControl>
                  <Input placeholder="Microsoft" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tipoLicencia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Licencia</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="SUSCRIPCION">Suscripción</SelectItem>
                    <SelectItem value="PERPETUA">Perpetua</SelectItem>
                    <SelectItem value="PRUEBA">Prueba</SelectItem>
                    <SelectItem value="OEM">OEM</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="claveProducto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Clave de Producto</FormLabel>
              <FormControl>
                <Input placeholder="XXXXX-XXXXX-XXXXX-XXXXX" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cantidadTotal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cantidad Total</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cantidadAsignada"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cantidad Asignada</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="costoUnitario"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Costo Unitario</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="costoTotal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Costo Total</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} readOnly className="bg-muted" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fechaCompra"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Compra</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {tipoLicencia !== 'PERPETUA' && (
            <FormField
              control={form.control}
              name="fechaExpiracion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Expiración</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
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
                  <SelectItem value="ACTIVA">Activa</SelectItem>
                  <SelectItem value="POR_RENOVAR">Por Renovar</SelectItem>
                  <SelectItem value="EXPIRADA">Expirada</SelectItem>
                  <SelectItem value="CANCELADA">Cancelada</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4 items-end">
          <FormField
            control={form.control}
            name="autoRenovacion"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Auto-renovación</FormLabel>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="diasNotificacion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Días para notificar antes</FormLabel>
                <FormControl>
                  <Input type="number" min="0" placeholder="30" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notas"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Textarea placeholder="Notas adicionales..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Guardando..." : (initialData ? "Actualizar Licencia" : "Guardar Licencia")}
        </Button>
      </form>
    </Form>
  );
}
