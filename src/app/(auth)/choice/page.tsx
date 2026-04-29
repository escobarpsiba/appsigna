import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { Shield, Building2, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function AuthChoicePage() {
  const adminSupabase = await createAdminClient()
  const { data: { user } } = await adminSupabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Buscar dados do perfil e clínica usando cliente admin
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select(`
      name,
      role,
      tenants (
        name,
        slug
      )
    `)
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin' || !profile.tenants) {
    redirect("/dashboard")
  }

  const firstName = profile.name?.split(" ")[0] || "Administrador"

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-[800px] space-y-8">
        <div className="flex flex-col items-center gap-2 text-center mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg mb-2">
            <span className="text-2xl font-bold text-white">S</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Olá, {firstName}</h1>
          <p className="text-muted-foreground text-lg">
            Como você deseja acessar a plataforma hoje?
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Opção Admin */}
          <Link href="/admin/dashboard" className="group">
            <Card className="h-full border-none shadow-xl transition-all hover:ring-2 hover:ring-primary/50 group-hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4 transition-transform group-hover:scale-110">
                  <Shield className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl">Administrador</CardTitle>
                <CardDescription className="text-base">
                  Gerencie clínicas, usuários e configurações globais da plataforma Signa.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pb-8">
                <div className="flex items-center gap-2 text-primary font-bold group-hover:gap-3 transition-all">
                  Acessar Painel Admin <ArrowRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Opção Clínica */}
          <Link href={`/c/${profile.tenants.slug}`} className="group">
            <Card className="h-full border-none shadow-xl transition-all hover:ring-2 hover:ring-emerald-500/50 group-hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4 transition-transform group-hover:scale-110">
                  <Building2 className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl">Minha Clínica</CardTitle>
                <CardDescription className="text-base">
                  Acesse o dashboard da <strong>{profile.tenants.name}</strong> para gerenciar seus pacientes e sessões.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pb-8">
                <div className="flex items-center gap-2 text-emerald-600 font-bold group-hover:gap-3 transition-all">
                  Ir para a Clínica <ArrowRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
        
        <div className="text-center">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-primary underline-offset-4 hover:underline">
            Sair e entrar com outra conta
          </Link>
        </div>
      </div>
    </div>
  )
}
