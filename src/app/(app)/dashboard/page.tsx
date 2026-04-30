import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CalendarDays,
  CircleDollarSign,
  Clock,
  TrendingUp,
  Users,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
} from "lucide-react"
import { format, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()
  const today = new Date()

  // 0. Buscar a clínica do usuário logado
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, name')
    .eq('id', user?.id)
    .single()

  const tenantId = profile?.tenant_id

  // 1. Buscar sessões de hoje da clínica
  const { data: appointmentsToday } = await supabase
    .from('appointments')
    .select('*, patients(name)')
    .eq('tenant_id', tenantId)
    .gte('starts_at', new Date(today.setHours(0,0,0,0)).toISOString())
    .lte('starts_at', new Date(today.setHours(23,59,59,999)).toISOString())

  // 2. Buscar pacientes ativos da clínica
  const { count: activePatients } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .eq('active', true)

  // 3. Buscar receita do mês (pagos) da clínica
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()
  const { data: paymentsMonth } = await supabase
    .from('payments')
    .select('amount')
    .eq('tenant_id', tenantId)
    .eq('status', 'paid')
    .gte('paid_at', firstDayOfMonth)

  const monthlyRevenue = paymentsMonth?.reduce((acc, p) => acc + p.amount, 0) || 0

  // 4. Buscar pagamentos pendentes da clínica
  const { count: pendingPayments } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .eq('status', 'pending')

  const userName = profile?.name?.split(" ")[0] || "Profissional"

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Bom dia, {userName}
        </h1>
        <p className="text-muted-foreground">Aqui está o resumo da sua clínica hoje, {format(today, "dd 'de' MMMM", { locale: ptBR })}.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-none bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Hoje</CardTitle>
            <CalendarDays className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointmentsToday?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Sessões agendadas</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-none bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePatients || 0}</div>
            <p className="text-xs text-muted-foreground">Em acompanhamento</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-none bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita (Mês)</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthlyRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">Total recebido este mês</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-none bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments || 0}</div>
            <p className="text-xs text-muted-foreground">Aguardando confirmação</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Agenda de Hoje */}
        <Card className="lg:col-span-4 shadow-sm border-none bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Agenda de Hoje</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/calendar" className="flex items-center gap-1">Ver completa <ArrowUpRight className="h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointmentsToday && appointmentsToday.length > 0 ? (
                appointmentsToday.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="text-sm font-bold w-12 text-primary">{format(new Date(item.starts_at), "HH:mm")}</div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{item.patients?.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{item.modality}</p>
                    </div>
                    <div className={`h-2 w-2 rounded-full ${item.status === 'completed' ? 'bg-emerald-500' : 'bg-primary'}`} />
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-muted-foreground italic">
                  Nenhuma sessão agendada para hoje.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Alertas & Insights */}
        <Card className="lg:col-span-3 shadow-sm border-none bg-primary/5 dark:bg-primary/10">
          <CardHeader className="flex flex-row items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Insights da Signa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold">{pendingPayments || 0} pacientes pendentes</p>
                <p className="text-xs text-muted-foreground">Existem pagamentos que ainda não foram marcados como concluídos.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <TrendingUp className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold">Faturamento Saudável</p>
                <p className="text-xs text-muted-foreground">Sua receita está dentro da média esperada para este período do mês.</p>
              </div>
            </div>
            <Button className="w-full mt-4 gap-2" variant="default" asChild>
              <Link href="/assistant">
                <Sparkles className="h-4 w-4" /> Falar com Assistente
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
