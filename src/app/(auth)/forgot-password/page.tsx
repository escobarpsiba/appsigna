"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

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

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = React.useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-[400px] space-y-8">
         <div className="flex flex-col items-center gap-2 text-center">
           <Link href="/login" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
             <ChevronLeft className="h-3 w-3" /> Voltar ao login
           </Link>
           <img src="/logopng.png" alt="Signa" className="h-32 w-32 md:h-48 md:w-48 rounded-xl object-contain" />
         </div>

        <Card className="shadow-xl border-none">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Recuperar senha</CardTitle>
            <CardDescription>
              {submitted 
                ? "Se o e-mail existir em nossa base, você receberá instruções em instantes."
                : "Digite seu e-mail para receber um link de recuperação."}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" placeholder="nome@exemplo.com" required />
                </div>
                <Button type="submit" className="w-full mt-2">
                  Enviar Link
                </Button>
              </form>
            ) : (
              <Button asChild variant="outline" className="w-full">
                <Link href="/login">Voltar ao início</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
