import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Search,
  Shield,
  Mail,
  Building2,
  Calendar,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { UserActionsDropdown } from "./user-actions-dropdown"
import { CreateUserDialog } from "./create-user-dialog"

export default async function AdminUsersPage() {
  const supabase = await createAdminClient()

  // 1. Buscar perfis
  const { data: users } = await supabase
    .from('profiles')
    .select(`
      *,
      tenants:tenants(name)
    `)
    .order('created_at', { ascending: false })

  // 2. Buscar clínicas
  const { data: tenants } = await supabase.from('tenants').select('id, name').order('name')

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Usuários</h1>
          <p className="text-muted-foreground">Gerencie os psicólogos e administradores da plataforma.</p>
        </div>
        <CreateUserDialog tenants={tenants || []} />
      </div>

      <div className="flex items-center gap-4 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por e-mail..."
            className="pl-8 bg-card/50 border-none shadow-sm"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {users && users.length > 0 ? (
          users.map((user) => (
            <Card key={user.id} className="shadow-sm overflow-hidden border-none bg-card/50">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        {user.name || user.email}
                        {user.role === 'admin' && <Shield className="h-4 w-4 text-amber-500" />}
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1 font-medium"><Mail className="h-3 w-3" /> {user.email}</span>
                        <span className="flex items-center gap-1 bg-primary/5 px-2 py-0.5 rounded text-primary">
                          <Building2 className="h-3 w-3" /> {user.tenants?.name || 'Sem Clínica Vinculada'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-8">
                    <div className="text-center md:text-left">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Membro desde</p>
                      <div className="flex items-center gap-1.5 mt-0.5 text-sm font-medium">
                        <Calendar className="h-3 w-3" />
                        {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>

                    <UserActionsDropdown user={user} tenants={tenants || []} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="py-20 text-center text-muted-foreground italic bg-muted/20 rounded-xl border-2 border-dashed">
            Nenhum usuário encontrado.
          </div>
        )}
      </div>
    </div>
  )
}
