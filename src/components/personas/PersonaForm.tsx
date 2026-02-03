'use client'

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { createPersonaAction } from '@/app/(dashboard)/personas/actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const PersonaSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().email("Email inválido"),
  departamento: z.string().min(1, "Departamento requerido"),
  cargo: z.string().optional(),
});

interface PersonaFormProps {
  onSuccess?: () => void;
}

export function PersonaForm({ onSuccess }: PersonaFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof PersonaSchema>>({
    resolver: zodResolver(PersonaSchema),
    defaultValues: {
      nombre: '',
      email: '',
      departamento: '',
      cargo: '',
    },
  });

  async function onSubmit(values: z.infer<typeof PersonaSchema>) {
    setLoading(true);
    try {
      const result = await createPersonaAction(values);
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
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Juan Perez" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="juan@empresa.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
             <FormField
          control={form.control}
          name="departamento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Departamento</FormLabel>
              <FormControl>
                <Input placeholder="IT" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cargo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cargo</FormLabel>
              <FormControl>
                <Input placeholder="Desarrollador" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        </div>
       
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Guardando..." : "Guardar Persona"}
        </Button>
      </form>
    </Form>
  );
}
