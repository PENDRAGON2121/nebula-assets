"use client"

import * as React from "react"
import {
  CalendarIcon,
  EnvelopeClosedIcon,
  FaceIcon,
  GearIcon,
  PersonIcon,
  RocketIcon,
} from "@radix-ui/react-icons" // Wait, I might not have radix icons, I should use lucide
import { 
    LayoutDashboard, 
    Package, 
    Users, 
    ArrowLeftRight, 
    Wrench, 
    Settings,
    Search,
    Loader2
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { useRouter } from "next/navigation"
import { globalSearchAction, SearchResult } from "@/app/actions"
import { navItems } from "@/config/nav"
import { Button } from "../ui/button"

export function CommandMenu() {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [data, setData] = React.useState<SearchResult[]>([])
  const [loading, setLoading] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "/" && !open) {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open])

  React.useEffect(() => {
    if (query.length < 2) {
        setData([])
        return
    }

    const timer = setTimeout(async () => {
        setLoading(true)
        try {
            const results = await globalSearchAction(query)
            setData(results)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-64 lg:w-80"
        onClick={() => setOpen(true)}
      >
        <span className="hidden lg:inline-flex">Buscar activos o páginas...</span>
        <span className="inline-flex lg:hidden">Buscar...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">/</span>
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
            placeholder="Escribe para buscar..." 
            value={query}
            onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
              {loading ? (
                  <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Buscando...
                  </div>
              ) : "No se encontraron resultados."}
          </CommandEmpty>
          
          {data.length > 0 && (
             <CommandGroup heading="Resultados de Búsqueda">
                {data.map((item) => (
                    <CommandItem
                        key={item.id}
                        value={item.title + item.subtitle} // Helps filtering if cmdk does local filter
                        onSelect={() => {
                            runCommand(() => router.push(item.url))
                        }}
                    >
                        {item.type === 'asset' ? <Package className="mr-2 h-4 w-4" /> : <Users className="mr-2 h-4 w-4" />}
                        <div className="flex flex-col">
                            <span>{item.title}</span>
                            <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                        </div>
                    </CommandItem>
                ))}
             </CommandGroup>
          )}

          <CommandSeparator />
          
          <CommandGroup heading="Navegación">
            {navItems.map((item) => (
                <CommandItem
                    key={item.href}
                    value={item.label}
                    onSelect={() => {
                        runCommand(() => router.push(item.href))
                    }}
                >
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.label}</span>
                </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
