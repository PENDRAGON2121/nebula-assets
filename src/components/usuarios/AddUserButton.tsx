"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useState } from "react"
import { UserDialog } from "./UserDialog"

export function AddUserButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" /> Nuevo Usuario
      </Button>
      <UserDialog isOpen={open} onClose={() => setOpen(false)} />
    </>
  )
}
