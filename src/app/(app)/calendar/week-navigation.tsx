"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

function NavBtn({ children, week }: { children: React.ReactNode; week: number }) {
  return (
    <button
      onClick={() => window.location.href = `/calendar?week=${week}`}
      className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-2 text-sm font-medium shadow-sm transition-all hover:bg-muted h-8 w-8"
    >
      {children}
    </button>
  )
}

export function WeekNavigation({ weekOffset }: { weekOffset: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <NavBtn week={weekOffset - 1}>
          <ChevronLeft className="h-4 w-4" />
        </NavBtn>
        <NavBtn week={weekOffset + 1}>
          <ChevronRight className="h-4 w-4" />
        </NavBtn>
      </div>
      <button
        onClick={() => window.location.href = "/calendar?week=0"}
        className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium shadow-sm transition-all hover:bg-muted h-8 gap-1.5"
      >
        Hoje
      </button>
    </div>
  )
}
