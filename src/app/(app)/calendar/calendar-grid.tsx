"use client"

import * as React from "react"
import { addDays, format, startOfWeek, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Repeat } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AppointmentDialog } from "./appointment-dialog"

const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"]

function toBrazilDate(dateString: string | Date) {
  return new Date(dateString)
}

export function CalendarGrid({ appointments, patients }: { appointments: any[]; patients: any[] }) {
  const [weekOffset, setWeekOffset] = React.useState(0)

  const today = new Date()
  const currentWeekStart = startOfWeek(addDays(today, weekOffset * 7), { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 6 }).map((_, i) => addDays(currentWeekStart, i))

  const weekStart = startOfWeek(currentWeekStart, { weekStartsOn: 1 })
  const weekEnd = addDays(weekStart, 5)

  const weekAppointments = appointments.filter(a => {
    const d = new Date(a.starts_at)
    return d >= startOfWeek(currentWeekStart, { weekStartsOn: 1 }) &&
      d <= addDays(weekStart, 6)
  })

  return (
    <Card className="shadow-sm overflow-hidden border-none bg-card/50">
      <CardHeader className="border-b border-muted/50 py-4 bg-muted/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <CardTitle className="text-lg font-semibold capitalize">
              {format(weekDays[0], "dd")} - {format(weekDays[5], "dd 'de' MMMM", { locale: ptBR })}
            </CardTitle>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setWeekOffset(p => p - 1)}
                className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-2 text-sm font-medium shadow-sm transition-all hover:bg-muted h-8 w-8"
                type="button"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setWeekOffset(p => p + 1)}
                className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-2 text-sm font-medium shadow-sm transition-all hover:bg-muted h-8 w-8"
                type="button"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => setWeekOffset(0)}
                className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium shadow-sm transition-all hover:bg-muted h-8 gap-1.5 ml-1"
                type="button"
              >
                Hoje
              </button>
            </div>
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
                const session = weekAppointments?.find(a =>
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
  )
}
