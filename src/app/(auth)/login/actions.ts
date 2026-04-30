"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"

export async function login(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError) {
    return { error: "Credenciais inválidas ou erro de conexão." }
  }

  const adminSupabase = await createAdminClient()

  // Buscar o cargo e o slug da clínica do usuário usando o cliente administrativo
  const { data: profile, error: profileError } = await adminSupabase
    .from('profiles')
    .select(`
      role,
      tenants (
        slug
      )
    `)
    .eq('id', authData.user.id)
    .single()

  if (profileError || !profile) {
    return { error: "Erro ao carregar perfil do usuário." }
  }

  // Redirecionamento baseado no cargo e clínica
  if (profile.role === 'admin') {
    // Se o admin também tiver uma clínica vinculada, oferece a escolha
    if (profile.tenants?.[0]?.slug) {
      redirect("/choice")
    }
    redirect("/admin/dashboard")
  } 
  
  // Se for usuário comum, tenta levar para a clínica dele
  const clinicSlug = profile.tenants?.[0]?.slug
  if (clinicSlug) {
    redirect(`/c/${clinicSlug}`)
  } else {
    // Se não tiver clínica ou slug, vai para o dashboard geral
    redirect("/dashboard")
  }
}
