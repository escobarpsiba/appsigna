"use client"

import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function WeekNavigation({ weekOffset }: { weekOffset: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Link
          href={`/calendar?week=${weekOffset - 1}`}
          className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-2 text-sm font-medium shadow-sm transition-all hover:bg-muted h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <Link
          href={`/calendar?week=${weekOffset + 1}`}
          className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-2 text-sm font-medium shadow-sm transition-all hover:bg-muted h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <Link
        href="/calendar?week=0"
        className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium shadow-sm transition-all hover:bg-muted h-8 gap-1.5"
      >
        Hoje
      </Link>
    </div>
  )
}
