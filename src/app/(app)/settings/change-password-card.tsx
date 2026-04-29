"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle2 } from "lucide-react"
import { updatePassword } from "./actions"

export function ChangePasswordCard() {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(event.currentTarget)
    const result = await updatePassword(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
      // Limpar formulário
      ;(event.target as HTMLFormElement).reset()
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Segurança da Conta</CardTitle>
        <CardDescription>Altere sua senha de acesso à plataforma.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2 max-w-sm">
            <Label htmlFor="password">Nova Senha</Label>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              required 
              disabled={loading}
              placeholder="Digite a nova senha"
            />
          </div>
          <div className="grid gap-2 max-w-sm">
            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
            <Input 
              id="confirmPassword" 
              name="confirmPassword" 
              type="password" 
              required 
              disabled={loading}
              placeholder="Confirme a nova senha"
            />
          </div>

          {error && (
            <p className="text-sm font-medium text-destructive">{error}</p>
          )}

          {success && (
            <div className="flex items-center gap-2 text-sm font-medium text-green-600 bg-green-50 p-3 rounded-lg border border-green-100">
              <CheckCircle2 className="h-4 w-4" />
              Senha atualizada com sucesso!
            </div>
          )}

          <Button type="submit" disabled={loading} className="gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Atualizar Senha
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
