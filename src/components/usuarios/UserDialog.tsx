'use client'

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createUser, updateUser } from '@/app/(dashboard)/usuarios/actions';
import { UserObj } from './columns';

const UserFormSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().optional(), // Optional for edit
  role: z.enum(["ADMIN", "USER"]),
});

interface UserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserObj; // If present, it's edit mode
}

export function UserDialog({ isOpen, onClose, user }: UserDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEdit = !!user;

  const form = useForm<z.infer<typeof UserFormSchema>>({
    resolver: zodResolver(UserFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'USER',
    },
  });

  // Reset form when opening dialog or switching user
  useEffect(() => {
      if (isOpen) {
          if (user) {
              form.reset({
                  name: user.name || '',
                  email: user.email,
                  role: user.role,
                  password: '' 
              })
          } else {
              form.reset({
                  name: '',
                  email: '',
                  role: 'USER',
                  password: ''
              })
          }
      }
  }, [isOpen, user, form])


  async function onSubmit(values: z.infer<typeof UserFormSchema>) {
    setLoading(true);
    try {
      let result;
      
      if (isEdit && user) {
          result = await updateUser(user.id, values);
      } else {
          // Validate password for new user
          if (!values.password || values.password.length < 6) {
             form.setError('password', { message: "Contraseña requerida (min 6 caracteres)" });
             setLoading(false);
             return;
          }
          // Type casting needed because Zod enum vs Prisma enum type mismatch in TS
          result = await createUser(values as any);
      }

      if (result.success) {
        onClose();
        router.refresh();
      } else {
        alert("Error: " + result.error);
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
          <DialogTitle>{isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
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

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="USER">Usuario (Operador)</SelectItem>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isEdit ? 'Contraseña (Dejar vacío para no cambiar)' : 'Contraseña'}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="******" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Guardando..." : (isEdit ? "Actualizar" : "Crear")}
                </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
