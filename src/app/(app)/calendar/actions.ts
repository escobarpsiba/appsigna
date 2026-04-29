"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function saveAppointment(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Não autorizado." }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return { error: "Clínica não encontrada." }

  const id = formData.get("id") as string
  const patient_id = formData.get("patient_id") as string
  const starts_at = formData.get("starts_at") as string
  const duration = parseInt(formData.get("duration") as string || "50")
  const amount = parseFloat(formData.get("amount") as string || "0")
  const modality = formData.get("modality") as string
  const status = formData.get("status") as string || "scheduled"
  const note = formData.get("note") as string

  const appointmentData = {
    tenant_id: profile.tenant_id,
    patient_id,
    starts_at,
    duration,
    amount,
    modality,
    status,
    note
  }

  let error;
  if (id) {
    const { error: updateError } = await supabase
      .from('appointments')
      .update(appointmentData)
      .eq('id', id)
    error = updateError
  } else {
    const { error: insertError, data: newAppointment } = await supabase
      .from('appointments')
      .insert([appointmentData])
      .select()
      .single()
    error = insertError

    // Se a sessão for criada como "concluída", gerar pagamento pendente
    if (!error && status === 'completed') {
      await supabase.from('payments').insert([{
        tenant_id: profile.tenant_id,
        patient_id,
        appointment_id: newAppointment.id,
        amount,
        status: 'pending'
      }])
    }
  }

  if (error) {
    console.error("Erro ao salvar agendamento:", error)
    return { error: "Não foi possível salvar o agendamento." }
  }

  revalidatePath("/calendar")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function updateAppointmentStatus(id: string, status: string) {
  const supabase = await createClient()
  const { data: appointment, error: fetchError } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError) return { error: "Agendamento não encontrado." }

  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id)

  if (error) return { error: "Erro ao atualizar status." }

  // Se marcar como concluído, criar registro financeiro
  if (status === 'completed') {
    await supabase.from('payments').insert([{
      tenant_id: appointment.tenant_id,
      patient_id: appointment.patient_id,
      appointment_id: appointment.id,
      amount: appointment.amount,
      status: 'pending'
    }])
  }
  
  revalidatePath("/calendar")
  revalidatePath("/financial")
  return { success: true }
}
