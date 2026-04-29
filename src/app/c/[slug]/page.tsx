import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function ClinicLinkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  
  // 1. Verificar se a clínica existe
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, name')
    .eq('slug', slug)
    .single()

  if (!tenant) {
    redirect("/login?error=clinica-nao-encontrada")
  }

  // 2. Verificar se o usuário está logado
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Redireciona para o login informando qual clínica ele quer acessar
    redirect(`/login?tenant=${tenant.id}`)
  }

  // 3. Verificar se o usuário pertence a esta clínica
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'admin') {
    // Admin pode entrar em qualquer uma (vincular temporariamente ou apenas visualizar)
    // Para simplificar, vamos levar ao dashboard
    redirect("/dashboard")
  }

  if (profile?.tenant_id !== tenant.id) {
    redirect("/dashboard?error=sem-acesso-a-esta-clinica")
  }

  redirect("/dashboard")
}
