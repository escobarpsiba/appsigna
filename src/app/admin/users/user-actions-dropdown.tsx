"use client"

import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Shield, Trash2, Loader2 } from "lucide-react"
import { LinkTenantSelector } from "./link-tenant-selector"
import { makeUserAdmin } from "./actions"
import { DeleteUserDialog } from "./delete-user-dialog"

interface UserActionsDropdownProps {
  user: any
  tenants: any[]
}

export function UserActionsDropdown({ user, tenants }: UserActionsDropdownProps) {
  const [loading, setLoading] = React.useState(false)

  async function handleMakeAdmin() {
    setLoading(true)
    await makeUserAdmin(user.id)
    setLoading(false)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger 
        render={
          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10" disabled={loading}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <MoreHorizontal className="h-5 w-5" />}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <LinkTenantSelector userId={user.id} tenants={tenants} />
        
        <DropdownMenuItem className="gap-2" onClick={handleMakeAdmin}>
          <Shield className="h-4 w-4" /> Tornar Admin
        </DropdownMenuItem>
        
        <DeleteUserDialog userId={user.id} userName={user.name || user.email} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
