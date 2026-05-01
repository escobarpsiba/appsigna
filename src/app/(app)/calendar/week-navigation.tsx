"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

function NavBtn({ children, week }: { children: React.ReactNode; week: number }) {
  const handleClick = () => {
    console.log("NavBtn clicked, week:", week)
    const url = `/calendar?week=${week}`
    console.log("Navigating to:", url)
    window.location.href = url
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-2 text-sm font-medium shadow-sm transition-all hover:bg-muted h-8 w-8"
      style={{ zIndex: 999, position: "relative", cursor: "pointer" }}
      type="button"
    >
      {children}
    </button>
  )
}

export function WeekNavigation({ weekOffset }: { weekOffset: number }) {
  console.log("WeekNavigation rendered with weekOffset:", weekOffset)
  
  return (
    <div className="flex items-center gap-2" style={{ zIndex: 999 }}>
      <div className="flex items-center gap-1" style={{ zIndex: 999 }}>
        <NavBtn week={weekOffset - 1}>
          <ChevronLeft className="h-4 w-4" />
        </NavBtn>
        <NavBtn week={weekOffset + 1}>
          <ChevronRight className="h-4 w-4" />
        </NavBtn>
      </div>
      <button
        onClick={() => {
          console.log("Hoje clicked")
          window.location.href = "/calendar?week=0"
        }}
        className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium shadow-sm transition-all hover:bg-muted h-8 gap-1.5"
        style={{ zIndex: 999, cursor: "pointer" }}
        type="button"
      >
        Hoje
      </button>
    </div>
  )
}
