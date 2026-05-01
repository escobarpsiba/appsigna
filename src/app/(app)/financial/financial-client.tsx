"use client"

import * as React from "react"
import { Download, Plus, Filter, CheckCircle2, AlertCircle } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { markAsPaid } from "./actions"
import { PaymentDialog } from "./payment-dialog"

interface FinancialClientProps {
  payments: any[]
  patients: any[]
  revenueData: any[]
  statusData: any[]
}

export function FinancialClient({ payments, patients, revenueData, statusData }: FinancialClientProps) {
  const [loading, setLoading] = React.useState<string | null>(null)

  async function handleMarkAsPaid(id: string) {
    setLoading(id)
    await markAsPaid(id)
    setLoading(null)
  }

  function isOverdue(payment: any) {
    if (payment.status === 'paid') return false
    if (!payment.appointments?.starts_at) return false
    return new Date(payment.appointments.starts_at) < new Date()
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground">Monitore o faturamento e recebimentos da sua clínica.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" /> Exportar
          </Button>
          <PaymentDialog patients={patients} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Gráfico de Barras - Receita */}
        <Card className="lg:col-span-4 shadow-sm border-none bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg">Faturamento Mensal</CardTitle>
            <CardDescription>Receita total realizada nos últimos meses.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `R$ ${value}`} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(var(--primary-rgb), 0.05)' }}
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                      backgroundColor: 'oklch(var(--background))' 
                    }}
                  />
                  <Bar dataKey="total" fill="oklch(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Status */}
        <Card className="lg:col-span-3 shadow-sm border-none bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg">Status de Recebíveis</CardTitle>
            <CardDescription>Distribuição de pagamentos.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2 w-full">
              {statusData.map((s) => (
                <div key={s.name} className="flex items-center gap-2 bg-muted/30 p-2 rounded-lg">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">{s.name}</span>
                    <span className="text-sm font-semibold">{s.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Pagamentos */}
      <Card className="shadow-sm border-none bg-card/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Pagamentos Recentes</CardTitle>
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filtrar
          </Button>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-muted/50 hover:bg-transparent">
                  <TableHead>Paciente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="hidden md:table-cell">Método</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => {
                  const overdue = isOverdue(payment)
                  return (
                    <TableRow key={payment.id} className="border-muted/50 hover:bg-muted/30 transition-colors">
                      <TableCell className="font-semibold">{payment.patients?.name}</TableCell>
                      <TableCell className="text-sm">
                        {payment.paid_at 
                          ? new Date(payment.paid_at).toLocaleDateString('pt-BR') 
                          : (payment.appointments?.starts_at 
                              ? new Date(payment.appointments.starts_at).toLocaleDateString('pt-BR') 
                              : 'N/A')}
                      </TableCell>
                      <TableCell className="font-bold text-primary">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payment.amount)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm italic opacity-70">
                        {payment.method || '—'}
                      </TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          payment.status === 'paid' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                          payment.status === 'pending' ? (overdue ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400') :
                          'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
                        }`}>
                          {payment.status === 'paid' && <CheckCircle2 className="h-3 w-3" />}
                          {payment.status === 'pending' && <AlertCircle className="h-3 w-3" />}
                          {payment.status === 'paid' ? 'Pago' : payment.status === 'pending' ? (overdue ? 'Atrasado' : 'Pendente') : 'Atrasado'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {payment.status === 'paid' ? (
                          <span className="text-[10px] text-muted-foreground italic">—</span>
                        ) : (
                          <Button 
                            size="sm" 
                            variant={overdue ? "destructive" : "outline"}
                            className="h-7 text-[10px] font-bold"
                            onClick={() => handleMarkAsPaid(payment.id)}
                            disabled={loading === payment.id}
                          >
                            {loading === payment.id ? "..." : overdue ? "Marcar Pago" : "Confirmar"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="py-10 text-center text-muted-foreground italic">
              Nenhum pagamento registrado ainda.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
