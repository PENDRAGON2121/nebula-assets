"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { updateProfileAction } from "@/app/(dashboard)/configuracion/actions"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

interface ProfileFormProps {
    user: {
        name?: string | null
        email?: string | null
        role?: string | null // Assuming role might be passed or just static for now since schema has Role enum but next-auth session might vary
    }
}

export function ProfileForm({ user }: ProfileFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            name: user.name || "",
        },
    })

    async function onSubmit(data: ProfileFormValues) {
        setIsLoading(true)
        setMessage(null)
        
        const result = await updateProfileAction(data)
        
        if (result.success) {
            setMessage({ type: 'success', text: "Perfil actualizado correctamente" })
            router.refresh()
        } else {
            setMessage({ type: 'error', text: result.error || "Ocurrió un error" })
        }
        
        setIsLoading(false)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {message && (
                    <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {message.text}
                    </div>
                )}
                
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre</FormLabel>
                            <FormControl>
                                <Input placeholder="Tu nombre" {...field} />
                            </FormControl>
                            <FormDescription>
                                Este es el nombre que se mostrará en tu perfil.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                <div className="space-y-2">
                    <FormLabel>Email</FormLabel>
                    <Input value={user.email || ''} disabled className="bg-muted" />
                </div>

                <div className="space-y-2">
                    <FormLabel>Rol</FormLabel>
                    <Input value="Administrador" disabled className="bg-muted" />
                </div>

                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar Cambios
                </Button>
            </form>
        </Form>
    )
}
