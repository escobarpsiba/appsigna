"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

const RECURRING_WEEKS = 26

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
  const recurring = formData.get("recurring") === "true"

  if (id) {
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

    const { error: updateError } = await supabase
      .from('appointments')
      .update(appointmentData)
      .eq('id', id)

    if (updateError) {
      console.error("Erro ao atualizar agendamento:", updateError)
      return { error: "Não foi possível salvar o agendamento." }
    }

    revalidatePath("/calendar")
    revalidatePath("/dashboard")
    return { success: true }
  }

  // Novo agendamento
  if (recurring) {
    const recurrenceGroupId = crypto.randomUUID()
    const baseDate = new Date(starts_at)

    const appointmentsToInsert = Array.from({ length: RECURRING_WEEKS }).map((_, i) => {
      const sessionDate = new Date(baseDate.getTime() + i * 7 * 24 * 60 * 60 * 1000)
      return {
        tenant_id: profile.tenant_id,
        patient_id,
        starts_at: sessionDate.toISOString(),
        duration,
        amount,
        modality,
        status: i === 0 ? status : 'scheduled',
        note,
        recurrence_group_id: recurrenceGroupId,
        is_recurring: true
      }
    })

    const { error: insertError, data: newAppointments } = await supabase
      .from('appointments')
      .insert(appointmentsToInsert)
      .select()

    if (insertError) {
      console.error("Erro ao salvar agendamentos recorrentes:", insertError)
      return { error: "Não foi possível salvar os agendamentos recorrentes." }
    }

    const firstAppointment = newAppointments?.[0]

    if (!insertError && status === 'completed' && firstAppointment) {
      await supabase.from('payments').insert([{
        tenant_id: profile.tenant_id,
        patient_id,
        appointment_id: firstAppointment.id,
        amount,
        status: 'pending'
      }])
    }
  } else {
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

    const { error: insertError, data: newAppointment } = await supabase
      .from('appointments')
      .insert([appointmentData])
      .select()
      .single()

    if (insertError) {
      console.error("Erro ao salvar agendamento:", insertError)
      return { error: "Não foi possível salvar o agendamento." }
    }

    if (status === 'completed' && newAppointment) {
      await supabase.from('payments').insert([{
        tenant_id: profile.tenant_id,
        patient_id,
        appointment_id: newAppointment.id,
        amount,
        status: 'pending'
      }])
    }
  }

  revalidatePath("/calendar")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function cancelRecurringSeries(recurrenceGroupId: string, cancelFutureOnly: boolean = true) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Não autorizado." }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return { error: "Clínica não encontrada." }

  if (cancelFutureOnly) {
    const now = new Date().toISOString()
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('recurrence_group_id', recurrenceGroupId)
      .eq('tenant_id', profile.tenant_id)
      .gte('starts_at', now)
      .eq('status', 'scheduled')

    if (error) {
      console.error("Erro ao cancelar série recorrente:", error)
      return { error: "Não foi possível cancelar a série." }
    }
  } else {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('recurrence_group_id', recurrenceGroupId)
      .eq('tenant_id', profile.tenant_id)

    if (error) {
      console.error("Erro ao cancelar série recorrente:", error)
      return { error: "Não foi possível cancelar a série." }
    }
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
