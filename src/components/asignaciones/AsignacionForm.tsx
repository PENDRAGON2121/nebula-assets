'use client'

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createAsignacionAction } from '@/app/(dashboard)/asignaciones/actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activo, Persona } from '@prisma/client';

const AsignacionSchema = z.object({
  activoId: z.string().min(1, "Selecciona un activo"),
  personaId: z.string().min(1, "Selecciona una persona"),
  observaciones: z.string().optional(),
  file: z.any().optional(), // File validation is tricky in Zod/Client, treating as any for now
});

interface AsignacionFormProps {
  activosDisponibles: Activo[];
  personas: Persona[];
  onSuccess?: () => void;
}

export function AsignacionForm({ activosDisponibles, personas, onSuccess }: AsignacionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof AsignacionSchema>>({
    resolver: zodResolver(AsignacionSchema),
    defaultValues: {
      activoId: '',
      personaId: '',
      observaciones: '',
    },
  });

  async function onSubmit(values: z.infer<typeof AsignacionSchema>) {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('activoId', values.activoId);
      formData.append('personaId', values.personaId);
      if (values.observaciones) formData.append('observaciones', values.observaciones);
      
      // Handle File Input safely
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput && fileInput.files && fileInput.files[0]) {
          formData.append('file', fileInput.files[0]);
      }

      const result = await createAsignacionAction(formData);
      
      if (result.success) {
        form.reset();
        router.refresh();
        if (onSuccess) onSuccess();
      } else {
        alert("Error: " + JSON.stringify(result.error));
      }
    } catch(e) {
        console.error(e)
        alert("Error inesperado")
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
              <FormLabel>Activo (Disponible)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar activo..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {activosDisponibles.map((activo) => (
                    <SelectItem key={activo.id} value={activo.id}>
                      {activo.nombre} ({activo.codigoInterno})
                    </SelectItem>
                  ))}
                  {activosDisponibles.length === 0 && (
                     <SelectItem value="none" disabled>No hay activos disponibles</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="personaId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asignar a</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar persona..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {personas.map((persona) => (
                    <SelectItem key={persona.id} value={persona.id}>
                      {persona.nombre} - {persona.departamento}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="observaciones"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observaciones</FormLabel>
              <FormControl>
                <Input placeholder="Entrega de equipo nuevo..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
            <FormLabel>Hoja de Asignación (Imagen/Foto)</FormLabel>
            <FormControl>
                <Input type="file" accept="image/*" />
            </FormControl>
            <p className="text-xs text-muted-foreground">Sube una foto de la hoja firmada.</p>
        </FormItem>
        
        <Button type="submit" className="w-full" disabled={loading || activosDisponibles.length === 0}>
          {loading ? "Asignando..." : "Confirmar Asignación"}
        </Button>
      </form>
    </Form>
  );
}
