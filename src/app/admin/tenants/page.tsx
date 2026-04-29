import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Building2, 
  Plus, 
  MoreHorizontal, 
  Search,
  CheckCircle2,
  XCircle,
  Globe
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

import { updateTenantSlug } from "./actions"
import { CreateTenantDialog } from "./create-tenant-dialog"

export default async function AdminTenantsPage() {
  const supabase = await createAdminClient()

  // Buscar todas as clínicas
  const { data: tenants, error } = await supabase
    .from('tenants')
    .select(`
      *,
      profiles:profiles(count)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Clínicas</h1>
          <p className="text-muted-foreground">Gerencie todos os tenants e clientes da plataforma Signa.</p>
        </div>
        <CreateTenantDialog />
      </div>

      <div className="flex items-center gap-4 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar clínica por nome..."
            className="pl-8"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {tenants && tenants.length > 0 ? (
          tenants.map((tenant) => (
            <Card key={tenant.id} className="shadow-sm overflow-hidden border-none bg-card/50">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{tenant.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Globe className="h-3 w-3" /> 
                        localhost:3000/c/{tenant.slug || tenant.id.substring(0, 8)}
                      </p>
                      {!tenant.slug && (
                        <form action={async () => {
                          "use server"
                          await updateTenantSlug(tenant.id, tenant.name)
                        }}>
                          <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary">
                            Gerar link amigável
                          </Button>
                        </form>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-8">
                    <div className="text-center md:text-left">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Status</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {tenant.status === 'active' ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <span className="text-sm font-medium">Ativo</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-destructive" />
                            <span className="text-sm font-medium">Inativo</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-center md:text-left">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Usuários</p>
                      <p className="text-sm font-medium mt-0.5">{tenant.profiles[0]?.count || 0} usuários</p>
                    </div>

                    <div className="text-center md:text-left">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Criado em</p>
                      <p className="text-sm font-medium mt-0.5">
                        {new Date(tenant.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger 
                        render={
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Editar Dados</DropdownMenuItem>
                        <DropdownMenuItem>Ver Usuários</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Suspender Clínica</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-xl border-2 border-dashed border-muted">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
            <p className="text-muted-foreground">Nenhuma clínica encontrada.</p>
            <CreateTenantDialog variant="link" />
          </div>
        )}
      </div>
    </div>
  )
}
