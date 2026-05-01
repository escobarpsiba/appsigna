import { createClient } from "@/lib/supabase/server"
import { Calendar as CalendarIcon, Clock, MapPin, Repeat } from "lucide-react"
import { addDays, format, startOfWeek, addWeeks, subWeeks, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AppointmentDialog } from "./appointment-dialog"
import { WeekNavigation } from "./week-navigation"


function toBrazilDate(dateString: string | Date) {
  return new Date(dateString)
}

const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"]

export const dynamic = "force-dynamic"

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>
}) {
  const resolved = await searchParams
  const weekOffset = parseInt(resolved.week || "0")
  const supabase = await createClient()

  // 0. Buscar a clínica do usuário logado
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user?.id)
    .single()

  const tenantId = profile?.tenant_id

  const today = new Date()
  const currentWeekStart = startOfWeek(addWeeks(today, weekOffset), { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 6 }).map((_, i) => addDays(currentWeekStart, i))

  // Buscar pacientes da clínica (para o modal)
  const { data: patients } = await supabase
    .from('patients')
    .select('id, name')
    .eq('tenant_id', tenantId)
    .eq('active', true)

  // Buscar agendamentos da semana da clínica
  const startIso = currentWeekStart.toISOString()
  const endIso = addDays(currentWeekStart, 6).toISOString()

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, patients(name)')
    .eq('tenant_id', tenantId)
    .gte('starts_at', startIso)
    .lte('starts_at', endIso)

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
        {/* Sidebar Summary */}
        <div className="space-y-6">
          <Card className="shadow-sm border-none bg-card/50">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Sessões Hoje
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {appointments?.filter(a => isSameDay(new Date(a.starts_at), today)).length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Nenhuma sessão para hoje.</p>
              ) : (
                appointments?.filter(a => isSameDay(new Date(a.starts_at), today)).map(a => (
                  <div key={a.id} className="flex flex-col gap-1 border-l-2 border-primary pl-3 py-1">
                    <span className="text-sm font-bold flex items-center gap-1.5">
                      {format(new Date(a.starts_at), "HH:mm")} - {a.patients?.name}
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

        {/* Main Weekly View */}
        <Card className="lg:col-span-3 shadow-sm overflow-hidden border-none bg-card/50">
          <CardHeader className="border-b border-muted/50 py-4 bg-muted/20">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold capitalize">
                  {format(weekDays[0], "dd")} - {format(weekDays[5], "dd 'de' MMMM", { locale: ptBR })}
                </h2>
                <WeekNavigation weekOffset={weekOffset} />
              </div>
              <WeekNavigation weekOffset={weekOffset} />
            </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-7 border-b border-muted/50 bg-muted/10">
              <div className="p-2 border-r border-muted/50 w-16" />
              {weekDays.map((day) => (
                <div key={day.toString()} className={`p-2 border-r border-muted/50 text-center ${isSameDay(day, today) ? 'bg-primary/5' : ''}`}>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{format(day, "eee", { locale: ptBR })}</span>
                  <div className={`text-sm font-bold ${isSameDay(day, today) ? 'text-primary' : ''}`}>{format(day, "dd")}</div>
                </div>
              ))}
            </div>
            <div className="relative h-[650px] overflow-y-auto">
              {timeSlots.map((time) => (
                <div key={time} className="grid grid-cols-7 border-b border-muted/50 group h-16">
                  <div className="p-2 border-r border-muted/50 bg-muted/5 text-[10px] font-bold text-muted-foreground w-16 text-right pr-3 pt-2">
                    {time}
                  </div>
                  {weekDays.map((day) => {
                    const session = appointments?.find(a =>
                      isSameDay(toBrazilDate(a.starts_at), day) &&
                      format(toBrazilDate(a.starts_at), "HH:mm") === time
                    )

                    return (
                      <div key={day.toString()} className="border-r border-muted/50 relative hover:bg-muted/30 transition-colors">
                        {session && (
                          <div className={`absolute inset-1 rounded-lg p-2 text-[11px] font-semibold overflow-hidden shadow-sm flex flex-col border-l-4 ${session.status === 'completed'
                              ? 'bg-emerald-100/80 text-emerald-800 border-emerald-500 dark:bg-emerald-900/40 dark:text-emerald-300'
                              : session.status === 'cancelled'
                                ? 'bg-muted text-muted-foreground border-muted-foreground/30'
                                : 'bg-primary/10 text-primary border-primary'
                            }`}>
                            <span className="truncate">{session.patients?.name}</span>
                            <span className="text-[9px] opacity-70 uppercase flex items-center gap-0.5">
                              {session.modality}
                              {session.is_recurring && <Repeat className="h-2.5 w-2.5" />}
                            </span>
                          </div>
                        )}
                        {!session && (
                          <AppointmentDialog
                            patients={patients || []}
                            selectedDate={day}
                            trigger={<div className="absolute inset-0 cursor-plus opacity-0 group-hover:opacity-100" title={`Agendar às ${time}`} />}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
