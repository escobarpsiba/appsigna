import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/mode-toggle"

import { createClient } from "@/lib/supabase/server"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user?.id)
    .single()

  const name = profile?.name || user?.email || "Usuário"
  const initials = name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                {initials}
              </div>
              <span className="text-sm font-medium">{name}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
