"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function WeekNavigation({ weekOffset }: { weekOffset: number }) {
  const router = useRouter()

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => router.push(`/calendar?week=${weekOffset - 1}`)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => router.push(`/calendar?week=${weekOffset + 1}`)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push("/calendar?week=0")}
      >
        Hoje
      </Button>
    </div>
  )
}
