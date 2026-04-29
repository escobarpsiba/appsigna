import { createClient } from "@/lib/supabase/server"
import { FinancialClient } from "./financial-client"

export default async function FinancialPage() {
  const supabase = await createClient()

  // 0. Buscar a clínica do usuário logado
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user?.id)
    .single()

  const tenantId = profile?.tenant_id

  // Buscar apenas os pagamentos da clínica do usuário
  const { data: payments } = await supabase
    .from('payments')
    .select('*, patients(name), appointments(starts_at)')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  // Buscar pacientes da clínica para o diálogo de pagamento
  const { data: patients } = await supabase
    .from('patients')
    .select('id, name')
    .eq('tenant_id', tenantId)
    .eq('active', true)
    .order('name', { ascending: true })

  // Agregação para o gráfico de faturamento (últimos 4 meses)
  const monthlyRevenue = [
    { name: "Jan", total: 0 },
    { name: "Fev", total: 0 },
    { name: "Mar", total: 0 },
    { name: "Abr", total: 0 },
  ]

  payments?.forEach(p => {
    if (p.status === 'paid' && p.paid_at) {
      const month = new Date(p.paid_at).getMonth()
      if (month === 0) monthlyRevenue[0].total += p.amount
      if (month === 1) monthlyRevenue[1].total += p.amount
      if (month === 2) monthlyRevenue[2].total += p.amount
      if (month === 3) monthlyRevenue[3].total += p.amount
    }
  })

  // Agregação para o gráfico de pizza (Status)
  const statusCounts = { paid: 0, pending: 0, overdue: 0 }
  payments?.forEach(p => {
    statusCounts[p.status as keyof typeof statusCounts] += 1
  })

  const total = (payments?.length || 1)
  const statusData = [
    { name: "Pago", value: Math.round((statusCounts.paid / total) * 100), color: "oklch(0.65 0.1 150)" },
    { name: "Pendente", value: Math.round((statusCounts.pending / total) * 100), color: "oklch(0.85 0.1 80)" },
    { name: "Atrasado", value: Math.round((statusCounts.overdue / total) * 100), color: "oklch(0.6 0.2 25)" },
  ].filter(s => s.value > 0)

  return (
    <FinancialClient 
      payments={payments || []} 
      patients={patients || []}
      revenueData={monthlyRevenue}
      statusData={statusData.length > 0 ? statusData : [{ name: "Sem Dados", value: 100, color: "oklch(0.9 0 0)" }]}
    />
  )
}
