"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Laptop, Moon, Sun } from "lucide-react"

export function ThemeSelector() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Avoid hydration mismatch by rendering a placeholder or default state until mounted
  if (!mounted) {
      return (
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" disabled>
                <Sun className="h-4 w-4" /> Light
            </Button>
             <Button variant="outline" size="sm" className="gap-2" disabled>
                <Moon className="h-4 w-4" /> Dark
            </Button>
             <Button variant="outline" size="sm" className="gap-2" disabled>
                <Laptop className="h-4 w-4" /> System
            </Button>
        </div>
      )
  }

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant={theme === 'light' ? 'default' : 'outline'} 
        size="sm" 
        onClick={() => setTheme("light")}
        className="gap-2"
      >
        <Sun className="h-4 w-4" />
        Light
      </Button>
      <Button 
        variant={theme === 'dark' ? 'default' : 'outline'} 
        size="sm" 
        onClick={() => setTheme("dark")}
        className="gap-2"
      >
        <Moon className="h-4 w-4" />
        Dark
      </Button>
      <Button 
        variant={theme === 'system' ? 'default' : 'outline'} 
        size="sm" 
        onClick={() => setTheme("system")}
        className="gap-2"
      >
        <Laptop className="h-4 w-4" />
        System
      </Button>
    </div>
  )
}
