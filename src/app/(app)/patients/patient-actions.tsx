"use client"

import * as React from "react"
import { MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PatientDialog } from "./patient-dialog"
import { deletePatient } from "./actions"

interface PatientActionsProps {
  patient: any
}

export function PatientActions({ patient }: PatientActionsProps) {
  const [deleting, setDeleting] = React.useState(false)

  async function handleDelete() {
    if (!confirm("Tem certeza que deseja excluir este paciente?")) return
    setDeleting(true)
    await deletePatient(patient.id)
    setDeleting(false)
  }

  return (
    <div className="flex items-center gap-1 justify-end">
      <PatientDialog 
        patient={patient} 
        trigger={
          <button className="inline-flex items-center justify-center rounded-lg h-8 px-2 text-xs hover:bg-muted transition-colors outline-none gap-1">
            <Pencil className="h-3 w-3" /> Editar
          </button>
        } 
      />
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="inline-flex items-center justify-center rounded-lg h-8 px-2 text-xs text-destructive hover:bg-destructive/10 transition-colors outline-none gap-1 disabled:opacity-50"
      >
        {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
        Excluir
      </button>
    </div>
  )
}
