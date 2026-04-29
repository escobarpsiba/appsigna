"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function markAsPaid(id: string, method: string = 'PIX') {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('payments')
    .update({ 
      status: 'paid', 
      method, 
      paid_at: new Date().toISOString() 
    })
    .eq('id', id)

  if (error) return { error: "Erro ao atualizar pagamento." }
  
  revalidatePath("/financial")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function createManualPayment(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Não autorizado." }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return { error: "Clínica não encontrada." }

  const patient_id = formData.get("patient_id") as string
  const amount = parseFloat(formData.get("amount") as string || "0")
  const method = formData.get("method") as string
  const status = formData.get("status") as string || "paid"

  const { error } = await supabase
    .from('payments')
    .insert([{
      tenant_id: profile.tenant_id,
      patient_id,
      amount,
      method,
      status,
      paid_at: status === 'paid' ? new Date().toISOString() : null
    }])

  if (error) {
    console.error("Erro ao criar pagamento:", error)
    return { error: "Não foi possível registrar o pagamento." }
  }

  revalidatePath("/financial")
  return { success: true }
}
