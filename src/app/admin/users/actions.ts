"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function linkUserToTenant(userId: string, tenantId: string) {
  const supabase = await createAdminClient()

  const { error } = await supabase
    .from('profiles')
    .update({ tenant_id: tenantId })
    .eq('id', userId)

  if (error) {
    console.error("Erro ao vincular usuário:", error.message)
    return { error: "Não foi possível vincular o usuário à clínica." }
  }

  revalidatePath("/admin/users")
  return { success: true }
}

export async function makeUserAdmin(userId: string) {
  const supabase = await createAdminClient()

  const { error } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', userId)

  if (error) return { error: "Erro ao promover usuário." }

  revalidatePath("/admin/users")
  return { success: true }
}

export async function createUser(formData: FormData) {
  const supabase = await createAdminClient()
  
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string
  const tenantId = formData.get("tenantId") as string

  if (!email || !password) return { error: "E-mail e senha são obrigatórios." }

  // 1. Criar usuário no Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name }
  })

  if (authError) return { error: `Erro ao criar conta: ${authError.message}` }

  // 2. Atualizar o perfil com o nome e tenant_id
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ 
      name, 
      tenant_id: tenantId || null,
      role: 'user'
    })
    .eq('id', authData.user.id)

  if (profileError) return { error: `Erro ao salvar perfil: ${profileError.message}` }

  revalidatePath("/admin/users")
  return { success: true }
}

export async function deleteUser(userId: string) {
  const supabase = await createAdminClient()

  const { error } = await supabase.auth.admin.deleteUser(userId)

  if (error) {
    console.error("Erro ao deletar:", error.message)
    return { error: "Erro ao excluir o usuário do sistema." }
  }

  revalidatePath("/admin/users")
  return { success: true }
}
