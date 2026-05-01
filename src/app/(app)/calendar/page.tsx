import { createClient } from "@/lib/supabase/server"
import { Clock, MapPin, Repeat } from "lucide-react"
import { addMonths, subMonths } from "date-fns"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AppointmentDialog } from "./appointment-dialog"
import { CalendarGrid } from "./calendar-grid"

export const dynamic = "force-dynamic"

export default async function CalendarPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user?.id)
    .single()

  const tenantId = profile?.tenant_id

  const today = new Date()
  const rangeStart = subMonths(today, 1).toISOString()
  const rangeEnd = addMonths(today, 7).toISOString()

  const { data: patients } = await supabase
    .from('patients')
    .select('id, name')
    .eq('tenant_id', tenantId)
    .eq('active', true)

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, patients(name)')
    .eq('tenant_id', tenantId)
    .gte('starts_at', rangeStart)
    .lte('starts_at', rangeEnd)

  const todayAppointments = appointments?.filter(a => {
    const d = new Date(a.starts_at)
    return d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
          <p className="text-muted-foreground">Gerencie seus horários e sessões.</p>
        </div>
        <AppointmentDialog patients={patients || []} />
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="space-y-6">
          <Card className="shadow-sm border-none bg-card/50">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Sessões Hoje
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(!todayAppointments || todayAppointments.length === 0) ? (
                <p className="text-sm text-muted-foreground italic">Nenhuma sessão para hoje.</p>
              ) : (
                todayAppointments.map(a => (
                  <div key={a.id} className="flex flex-col gap-1 border-l-2 border-primary pl-3 py-1">
                    <span className="text-sm font-bold flex items-center gap-1.5">
                      {new Date(a.starts_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} - {a.patients?.name}
                      {a.is_recurring && <Repeat className="h-3 w-3 text-primary shrink-0" />}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {a.modality === 'online' ? 'Online' : 'Presencial'}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <CalendarGrid
            appointments={appointments || []}
            patients={patients || []}
          />
        </div>
      </div>
    </div>
  )
}
