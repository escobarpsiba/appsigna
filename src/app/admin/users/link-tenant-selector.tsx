"use client"

import * as React from "react"
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import { Building2, Link as LinkIcon, Loader2, ChevronRight } from "lucide-react"
import { linkUserToTenant } from "./actions"

interface LinkTenantSelectorProps {
  userId: string
  tenants: any[]
}

export function LinkTenantSelector({ userId, tenants }: LinkTenantSelectorProps) {
  const [loading, setLoading] = React.useState(false)

  async function handleLink(tenantId: string) {
    setLoading(true)
    await linkUserToTenant(userId, tenantId)
    setLoading(false)
  }

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger 
        className="gap-2 w-full justify-between"
        render={
          <button className="flex items-center justify-between w-full outline-none">
            <div className="flex items-center gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LinkIcon className="h-4 w-4" />}
              Vincular à Clínica
            </div>
            <ChevronRight className="h-4 w-4 ml-auto" />
          </button>
        }
      />
      <DropdownMenuSubContent className="w-56">
        <DropdownMenuLabel>Selecione a Clínica</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {tenants.map((t) => (
          <DropdownMenuItem key={t.id} onClick={() => handleLink(t.id)} className="gap-2">
            <Building2 className="h-3 w-3" />
            {t.name}
          </DropdownMenuItem>
        ))}
        {tenants.length === 0 && (
          <div className="p-2 text-xs text-muted-foreground italic text-center">
            Nenhuma clínica cadastrada.
          </div>
        )}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}
