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
import { createUser, updateUser, getRoles } from '@/app/(dashboard)/usuarios/actions';
import { UserObj } from './columns';

const UserFormSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().optional(),
  roleId: z.string().min(1, "Rol requerido"),
});

interface UserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserObj;
}

export function UserDialog({ isOpen, onClose, user }: UserDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<{id: string, name: string}[]>([]);
  const isEdit = !!user;

  const form = useForm<z.infer<typeof UserFormSchema>>({
    resolver: zodResolver(UserFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      roleId: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
        getRoles().then(fetchedRoles => {
            setRoles(fetchedRoles);
            
            if (user) {
                form.reset({
                    name: user.name || '',
                    email: user.email,
                    roleId: user.roleId || '', 
                    password: '' 
                })
            } else {
                form.reset({
                    name: '',
                    email: '',
                    roleId: '',
                    password: ''
                })
            }
        });
    }
  }, [isOpen, user, form])


  async function onSubmit(values: z.infer<typeof UserFormSchema>) {
    setLoading(true);
    try {
      let result;
      
      if (isEdit && user) {
          result = await updateUser(user.id, values);
      } else {
          if (!values.password || values.password.length < 6) {
             form.setError('password', { message: "Contraseña requerida (min 6 caracteres)" });
             setLoading(false);
             return;
          }
          result = await createUser(values);
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
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar rol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles.map(role => (
                          <SelectItem key={role.id} value={role.id}>
                              {role.name}
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
