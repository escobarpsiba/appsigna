"use client"

import * as React from "react"
import Link from "next/link"
import { login } from "./actions"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"
import { useSearchParams } from "next/navigation"

export default function LoginPage() {
  return (
    <React.Suspense fallback={null}>
      <LoginFormInner />
    </React.Suspense>
  )
}

function LoginFormInner() {
  const searchParams = useSearchParams()
  const urlError = searchParams.get("error")
  
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (urlError === "clinica-nao-encontrada") {
      setError("Clínica não encontrada. Verifique o link e tente novamente.")
    } else if (urlError === "sem-acesso-a-esta-clinica") {
      setError("Você não tem permissão para acessar esta clínica.")
    }
  }, [urlError])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const result = await login(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
       <div className="w-full max-w-[400px] space-y-2">
         <div className="flex flex-col items-center gap-2 text-center">
           <img src="/logopng.png" alt="Signa" className="h-32 w-32 md:h-48 md:w-48 rounded-xl object-contain" />
         </div>

        <Card className="shadow-xl border-none">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Bem-vindo de volta</CardTitle>
            <CardDescription>
              Entre com seu e-mail e senha para acessar sua conta.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="nome@exemplo.com" 
                  required 
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-primary hover:underline"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required 
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-center text-xs text-muted-foreground w-full">
              Ao entrar, você concorda com nossos{" "}
              <Link href="#" className="underline hover:text-primary">Termos de Serviço</Link> e{" "}
              <Link href="#" className="underline hover:text-primary">Política de Privacidade</Link>.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
