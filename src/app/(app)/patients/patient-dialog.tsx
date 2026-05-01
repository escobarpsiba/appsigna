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
import { savePatient } from "./actions"

interface PatientDialogProps {
  patient?: any
  trigger?: React.ReactElement
}

export function PatientDialog({ patient, trigger }: PatientDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [billingType, setBillingType] = React.useState(patient?.billing_type || "per_session")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const result = await savePatient(formData)

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
        render={trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Novo Paciente
          </Button>
        )}
      />
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <input type="hidden" name="id" value={patient?.id || ""} />
          <DialogHeader>
            <DialogTitle>{patient ? "Editar Paciente" : "Novo Paciente"}</DialogTitle>
            <DialogDescription>
              Preencha as informações básicas do analisando.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" name="name" defaultValue={patient?.name} required placeholder="Nome do paciente" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Telefone / WhatsApp</Label>
                <Input id="phone" name="phone" defaultValue={patient?.phone} required placeholder="(00) 00000-0000" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail (Opcional)</Label>
                <Input id="email" name="email" defaultValue={patient?.email} type="email" placeholder="email@exemplo.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="frequency">Frequência</Label>
                <select 
                  name="frequency" 
                  defaultValue={patient?.frequency || "Semanal"}
                  className="flex h-8 w-full items-center justify-between rounded-lg border border-transparent bg-muted/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-muted/20"
                >
                  <option value="Semanal">Semanal</option>
                  <option value="Quinzenal">Quinzenal</option>
                  <option value="Mensal">Mensal</option>
                  <option value="Variável">Variável</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="billing_type">Cobrança</Label>
                <select 
                  name="billing_type" 
                  defaultValue={patient?.billing_type || "per_session"}
                  onChange={(e) => setBillingType(e.target.value)}
                  className="flex h-8 w-full items-center justify-between rounded-lg border border-transparent bg-muted/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-muted/20"
                >
                  <option value="per_session">Por Sessão</option>
                  <option value="monthly_package">Pacote Mensal</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Valor da Sessão (R$)</Label>
                <Input id="price" name="price" defaultValue={patient?.price} type="number" step="0.01" required />
              </div>
              {billingType === "monthly_package" && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="monthly_price">Valor do Pacote Mensal (R$)</Label>
                    <Input id="monthly_price" name="monthly_price" defaultValue={patient?.monthly_price} type="number" step="0.01" placeholder="Ex: 800.00" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="payment_day">Dia de Vencimento</Label>
                    <select
                      id="payment_day"
                      name="payment_day"
                      defaultValue={patient?.payment_day || 5}
                      className="flex h-8 w-full items-center justify-between rounded-lg border border-transparent bg-muted/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-muted/20"
                    >
                      {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                        <option key={day} value={day}>Dia {day} de cada mês</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
            <input type="hidden" name="active" value="true" />
          </div>
          {error && <p className="text-sm font-medium text-destructive mb-4">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {patient ? "Salvar Alterações" : "Cadastrar Paciente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
