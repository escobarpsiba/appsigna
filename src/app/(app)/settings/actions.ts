"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (password !== confirmPassword) {
    return { error: "As senhas não coincidem." }
  }

  if (password.length < 6) {
    return { error: "A senha deve ter pelo menos 6 caracteres." }
  }

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    return { error: `Erro ao atualizar senha: ${error.message}` }
  }

  return { success: true }
}

export async function saveKnowledgeBase(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Não autorizado." }

  const tenantId = formData.get("tenant_id") as string
  const knowledgeBase = formData.get("knowledge_base") as string

  if (!tenantId) return { error: "Clínica não encontrada." }

  const { error } = await supabase
    .from('tenants')
    .update({ ai_knowledge_base: knowledgeBase })
    .eq('id', tenantId)

  if (error) {
    console.error("Erro ao salvar base de conhecimento:", error)
    return { error: "Não foi possível salvar as instruções." }
  }

  revalidatePath("/settings")
  return { success: true }
}
