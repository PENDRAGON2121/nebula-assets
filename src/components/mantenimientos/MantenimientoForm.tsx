'use client'

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createMantenimientoAction } from '@/app/(dashboard)/mantenimientos/actions';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Activo } from '@prisma/client';
import { Upload } from 'lucide-react';

const MantenimientoSchema = z.object({
  activoId: z.string().min(1, "Activo requerido"),
  tipo: z.enum(["PREVENTIVO", "CORRECTIVO"]),
  estado: z.enum(["PROGRAMADO", "EN_PROCESO", "COMPLETADO", "CANCELADO"]),
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof MantenimientoSchema>>({
    resolver: zodResolver(MantenimientoSchema),
    defaultValues: {
      activoId: '',
      tipo: 'PREVENTIVO',
      estado: 'PROGRAMADO',
      descripcion: '',
      realizadoPor: '',
      fechaInicio: new Date().toISOString().split('T')[0],
    },
  });

  async function onSubmit(values: z.infer<typeof MantenimientoSchema>) {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('activoId', values.activoId);
      formData.append('tipo', values.tipo);
      formData.append('estado', values.estado);
      formData.append('descripcion', values.descripcion);
      if (values.realizadoPor) formData.append('realizadoPor', values.realizadoPor);
      formData.append('fechaInicio', values.fechaInicio);
      
      if (fileInputRef.current?.files?.[0]) {
        formData.append('comprobante', fileInputRef.current.files[0]);
      }

      const result = await createMantenimientoAction(formData);
      
      if (result.success) {
        form.reset();
        // Reset file input manually
        if (fileInputRef.current) fileInputRef.current.value = '';
        
        router.refresh();
        if (onSuccess) onSuccess();
      } else {
        alert("Error: " + JSON.stringify(result.error));
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
        
        <div className="grid grid-cols-2 gap-4">
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
            name="estado"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Estado Inicial</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    <SelectItem value="PROGRAMADO">Programado</SelectItem>
                    <SelectItem value="EN_PROCESO">En Proceso</SelectItem>
                    {/* Usually you create as Programado or En Proceso. Completed is for updates. */}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

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

        <FormItem>
            <FormLabel>Adjuntar Comprobante/Reporte (Opcional)</FormLabel>
            <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Seleccionar Archivo
                </Button>
                <span className="text-xs text-muted-foreground">PDF o Imagen (Max 10MB)</span>
            </div>
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*,application/pdf"
                onChange={(e) => {
                    // Force re-render or show filename if desired, but for now just having it in ref is enough
                    // A small label showing selected filename would be nice
                    const span = e.target.nextElementSibling; // hacky, better to use state
                }}
            />
             {/* Simple filename display using a small helper text driven by state would be better, but keeping it simple */}
        </FormItem>

        <Button type="submit" className="w-full" disabled={loading || activosDisponibles.length === 0}>
          {loading ? "Registrando..." : "Registrar Mantenimiento"}
        </Button>
      </form>
    </Form>
  );
}
