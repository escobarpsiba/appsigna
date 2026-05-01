"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function savePatient(formData: FormData) {
  const supabase = await createClient()
  
  // Obter o perfil do usuário logado para saber o tenant_id
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Não autorizado." }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return { error: "Clínica não encontrada." }

  const id = formData.get("id") as string
  const name = formData.get("name") as string
  const phone = formData.get("phone") as string
  const email = formData.get("email") as string
  const price = parseFloat(formData.get("price") as string || "0")
  const frequency = formData.get("frequency") as string
  const billing_type = formData.get("billing_type") as string || "per_session"
  const monthly_price = parseFloat(formData.get("monthly_price") as string || "0")
  const payment_day = parseInt(formData.get("payment_day") as string || "5") || null
  const active = formData.get("active") === "true"

  const patientData = {
    tenant_id: profile.tenant_id,
    name,
    phone,
    email,
    price,
    frequency,
    billing_type,
    monthly_price,
    payment_day,
    active
  }

  let error;
  if (id) {
    const { error: updateError } = await supabase
      .from('patients')
      .update(patientData)
      .eq('id', id)
    error = updateError
  } else {
    const { error: insertError } = await supabase
      .from('patients')
      .insert([patientData])
    error = insertError
  }

  if (error) {
    console.error("Erro ao salvar paciente:", error)
    return { error: "Não foi possível salvar os dados do paciente." }
  }

  revalidatePath("/patients")
  return { success: true }
}

export async function deletePatient(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('patients')
    .delete()
    .eq('id', id)

  if (error) return { error: "Erro ao excluir paciente." }
  
  revalidatePath("/patients")
  return { success: true }
}
