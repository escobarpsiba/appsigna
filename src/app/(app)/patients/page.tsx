import { createClient } from "@/lib/supabase/server"
import { Search, UserPlus, Phone, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PatientDialog } from "./patient-dialog"
import { PatientActions } from "./patient-actions"

export default async function PatientsPage() {
  const supabase = await createClient()

  // 0. Buscar a clínica do usuário logado
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user?.id)
    .single()

  const tenantId = profile?.tenant_id

  // Buscar pacientes reais da clínica
  const { data: patients, error } = await supabase
    .from('patients')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('name', { ascending: true })

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pacientes</h1>
          <p className="text-muted-foreground">Gerencie o cadastro de seus analisandos.</p>
        </div>
        <PatientDialog />
      </div>

      <Card className="shadow-sm border-none bg-card/50">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar paciente..." 
                className="pl-10 bg-background/50"
              />
            </div>
            <Button variant="outline" className="hidden md:flex">Filtros</Button>
          </div>
        </CardHeader>
        <CardContent>
          {patients && patients.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-muted/50">
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden md:table-cell">Contato</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="hidden md:table-cell">Cobrança</TableHead>
                  <TableHead className="hidden md:table-cell">Frequência</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient.id} className="border-muted/50 hover:bg-muted/30 transition-colors">
                    <TableCell className="font-semibold">{patient.name}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-col text-xs text-muted-foreground gap-1">
                        <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {patient.phone}</span>
                        {patient.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {patient.email}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-primary">
                      {patient.billing_type === 'monthly_package' 
                        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(patient.monthly_price || 0) + '/mês'
                        : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(patient.price)
                      }
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        patient.billing_type === 'monthly_package' 
                          ? 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400' 
                          : 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400'
                      }`}>
                        {patient.billing_type === 'monthly_package' ? 'Pacote' : 'Sessão'}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{patient.frequency}</TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        patient.active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-muted text-muted-foreground'
                      }`}>
                        {patient.active ? 'Ativo' : 'Inativo'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <PatientActions patient={patient} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <UserPlus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">Nenhum paciente cadastrado</h3>
              <p className="text-muted-foreground max-w-xs mx-auto mb-6">
                Comece adicionando seu primeiro analisando para gerenciar sessões e pagamentos.
              </p>
              <PatientDialog />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
