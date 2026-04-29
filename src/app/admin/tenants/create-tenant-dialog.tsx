"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Loader2 } from "lucide-react"
import { createTenant } from "./actions"

interface CreateTenantDialogProps {
  variant?: "default" | "link"
  children?: React.ReactElement
}

export function CreateTenantDialog({ variant = "default", children }: CreateTenantDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const result = await createTenant(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setOpen(false)
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          children ? (
            children
          ) : (
            <Button variant={variant} className={variant === "default" ? "w-fit gap-2" : ""}>
              {variant === "default" && <Plus className="h-4 w-4" />}
              {variant === "default" ? "Nova Clínica" : "Criar a primeira clínica"}
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Cadastrar Nova Clínica</DialogTitle>
            <DialogDescription>
              Insira o nome da clínica ou do profissional. Você poderá configurar os usuários depois.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome da Clínica</Label>
              <Input
                id="name"
                name="name"
                placeholder="Ex: Clínica Escobar de Psicanálise"
                required
                disabled={loading}
              />
            </div>
            {error && (
              <p className="text-sm font-medium text-destructive">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Criar Clínica
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
