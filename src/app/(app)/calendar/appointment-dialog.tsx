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
import { Plus, Loader2, Calendar as CalendarIcon, Repeat } from "lucide-react"
import { saveAppointment } from "./actions"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface AppointmentDialogProps {
  patients: any[]
  appointment?: any
  selectedDate?: Date
  trigger?: React.ReactElement
}

export function AppointmentDialog({ patients, appointment, selectedDate, trigger }: AppointmentDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Prepara data/hora inicial
  const defaultDate = selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")
  const defaultTime = appointment ? format(new Date(appointment.starts_at), "HH:mm") : "09:00"

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    // Combinar data e hora com timezone do Brasil (UTC-3)
    const dateStr = formData.get("date") as string
    const timeStr = formData.get("time") as string
    formData.set("starts_at", `${dateStr}T${timeStr}:00-03:00`)

    const result = await saveAppointment(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setOpen(false)
      setLoading(false)
    }
  }

  // Check if the trigger is a non-button element (e.g. div from calendar slots)
  const isNonButtonTrigger = !!trigger && React.isValidElement(trigger) && typeof trigger.type === 'string' && trigger.type !== 'button'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        nativeButton={!isNonButtonTrigger}
        render={trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Nova Sessão
          </Button>
        )}
      />
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <input type="hidden" name="id" value={appointment?.id || ""} />
          <DialogHeader>
            <DialogTitle>{appointment ? "Editar Sessão" : "Agendar Sessão"}</DialogTitle>
            <DialogDescription>
              {appointment
                ? "Edite os detalhes da sessão."
                : "Selecione o paciente e defina o horário do atendimento."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="patient_id">Paciente</Label>
              <select 
                id="patient_id"
                name="patient_id" 
                defaultValue={appointment?.patient_id || ""}
                required
                className="flex h-9 w-full rounded-lg border border-transparent bg-muted/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-muted/20"
              >
                <option value="" disabled>Selecione um paciente...</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Data</Label>
                <Input id="date" name="date" type="date" defaultValue={defaultDate} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time">Horário</Label>
                <Input id="time" name="time" type="time" defaultValue={defaultTime} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input id="amount" name="amount" type="number" step="0.01" defaultValue={appointment?.amount || 0} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="modality">Modalidade</Label>
                <select 
                  name="modality" 
                  defaultValue={appointment?.modality || "presencial"}
                  className="flex h-9 w-full rounded-lg border border-transparent bg-muted/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-muted/20"
                >
                  <option value="presencial">Presencial</option>
                  <option value="online">Online</option>
                </select>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="note">Notas (Opcional)</Label>
              <Input id="note" name="note" defaultValue={appointment?.note} placeholder="Ex: Mudança de horário solicitada pelo paciente" />
            </div>

            {!appointment && (
              <label className="flex items-center gap-3 p-3 rounded-lg border border-border/50 cursor-pointer hover:bg-muted/50 transition-colors">
                <input
                  type="checkbox"
                  name="recurring"
                  value="true"
                  defaultChecked={false}
                  className="h-4 w-4 rounded border-muted-foreground/30 text-primary focus:ring-primary"
                />
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium flex items-center gap-1.5">
                    <Repeat className="h-3.5 w-3.5 text-primary" />
                    Repetir semanalmente
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Cria sessões automáticas por 6 meses (26 semanas)
                  </span>
                </div>
              </label>
            )}
          </div>
          {error && <p className="text-sm font-medium text-destructive mb-4">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {appointment ? "Salvar Alterações" : "Agendar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
