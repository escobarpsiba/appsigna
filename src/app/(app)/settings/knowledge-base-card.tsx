"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { saveKnowledgeBase } from "./actions"
import { Bot, Loader2, Check } from "lucide-react"

interface KnowledgeBaseCardProps {
  tenantId: string
  currentKnowledgeBase: string
}

export function KnowledgeBaseCard({ tenantId, currentKnowledgeBase }: KnowledgeBaseCardProps) {
  const [knowledgeBase, setKnowledgeBase] = React.useState(currentKnowledgeBase)
  const [loading, setLoading] = React.useState(false)
  const [saved, setSaved] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    setSaved(false)

    const formData = new FormData()
    formData.set("tenant_id", tenantId)
    formData.set("knowledge_base", knowledgeBase)

    const result = await saveKnowledgeBase(formData)

    if (result.error) {
      setError(result.error)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setLoading(false)
  }

  return (
    <Card className="shadow-sm border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          Assistente IA — Base de Conhecimento
        </CardTitle>
        <CardDescription>
          Instruções que orientam o tom, estilo de comunicação e comportamento do assistente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="knowledge_base">
            Instruções Personalizadas
          </Label>
          <Textarea
            id="knowledge_base"
            name="knowledge_base"
            value={knowledgeBase}
            onChange={(e) => setKnowledgeBase(e.target.value)}
            placeholder={
              "Ex:\n" +
              "- Use um tom acolhedor e empático ao gerar mensagens para pacientes\n" +
              "- Sempre se refira ao profissional como 'Doutor'\n" +
              "- Ao cobrar pagamentos, seja delicado e nunca constrangedor\n" +
              "- Prefira frases curtas e diretas\n" +
              "- Use linguagem formal, mas acessível"
            }
            rows={8}
            className="resize-y"
          />
          <p className="text-xs text-muted-foreground">
            Estas instruções serão usadas pelo assistente IA para adaptar suas respostas e mensagens geradas.
          </p>
        </div>

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{error}</p>
        )}

        <div className="flex items-center gap-2">
          <Button onClick={handleSubmit} disabled={loading || knowledgeBase === currentKnowledgeBase}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {saved ? <Check className="h-4 w-4 mr-1" /> : null}
            {saved ? "Salvo!" : "Salvar Instruções"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
