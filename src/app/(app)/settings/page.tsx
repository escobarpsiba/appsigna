import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ChangePasswordCard } from "./change-password-card"

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Gerencie seu perfil e preferências da plataforma.</p>
      </div>

      <div className="grid gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Perfil Profissional</CardTitle>
            <CardDescription>Informações que aparecem nas suas comunicações.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 max-w-sm">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" defaultValue="Dr. Lúcio Escobar" />
            </div>
            <div className="grid gap-2 max-w-sm">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" defaultValue="lucio@exemplo.com" disabled />
            </div>
            <div className="grid gap-2 max-w-sm">
              <Label htmlFor="phone">WhatsApp Profissional</Label>
              <Input id="phone" defaultValue="(11) 99999-8888" />
            </div>
            <Button className="mt-2">Salvar Alterações</Button>
          </CardContent>
        </Card>

        <ChangePasswordCard />

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Prática Clínica</CardTitle>
            <CardDescription>Configurações gerais do seu consultório.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 max-w-sm">
              <Label htmlFor="timezone">Fuso Horário</Label>
              <Input id="timezone" defaultValue="America/Sao_Paulo (GMT-3)" />
            </div>
            <div className="grid gap-2 max-w-sm">
              <Label htmlFor="currency">Moeda</Label>
              <Input id="currency" defaultValue="BRL (R$)" disabled />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Notificações por WhatsApp</p>
                <p className="text-xs text-muted-foreground">Receba lembretes de sessões pendentes.</p>
              </div>
              <Button variant="outline" size="sm">Configurar</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
