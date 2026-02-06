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
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { updateProfileAction } from "@/app/(dashboard)/configuracion/actions"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChangeEvent } from "react"

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
        image?: string | null
        role?: string | null
    }
}

export function ProfileForm({ user }: ProfileFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [preview, setPreview] = useState<string | null>(user.image || null)
    const [file, setFile] = useState<File | null>(null)

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            name: user.name || "",
        },
    })

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    }

    async function onSubmit(data: ProfileFormValues) {
        setIsLoading(true)
        setMessage(null)
        
        const formData = new FormData()
        formData.append('name', data.name)
        if (file) {
            formData.append('avatar', file)
        }

        const result = await updateProfileAction(formData)
        
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {message && (
                    <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {message.text}
                    </div>
                )}
                
                <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={preview || ""} alt={user.name || "User"} />
                        <AvatarFallback className="text-xl">
                            {user.name?.substring(0, 2).toUpperCase() || "US"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-2">
                        <FormLabel htmlFor="avatar-upload" className="cursor-pointer">
                            <div className="flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background hover:bg-accent hover:text-accent-foreground">
                                Cambiar Foto
                            </div>
                            <Input 
                                id="avatar-upload"
                                type="file" 
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </FormLabel>
                        <p className="text-xs text-muted-foreground">
                            JPG, PNG o WEBP. Máx 2MB.
                        </p>
                    </div>
                </div>

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
                    <Label htmlFor="email-display">Email</Label>
                    <Input id="email-display" value={user.email || ''} disabled className="bg-muted" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="role-display">Rol</Label>
                    <Input id="role-display" value={user.role || 'Usuario'} disabled className="bg-muted" />
                </div>

                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar Cambios
                </Button>
            </form>
        </Form>
    )
}
