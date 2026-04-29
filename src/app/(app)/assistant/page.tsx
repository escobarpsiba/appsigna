"use client"

import * as React from "react"
import { Send, Sparkles, User, Bot, Copy, RefreshCw, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { askAssistant } from "./actions"

const suggestions = [
  "Gerar mensagem de cobrança cordial",
  "Quem está há mais de 15 dias sem vir?",
  "Confirmar sessão para amanhã",
  "Quanto faturei este mês?",
]

export default function AssistantPage() {
  const [input, setInput] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [messages, setMessages] = React.useState([
    { role: "assistant", content: "Olá Dr. Lúcio! Sou o seu assistente Signa. Como posso ajudar você com sua clínica hoje?" }
  ])

  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo(0, scrollRef.current.scrollHeight)
    }
  }, [messages])

  const handleSend = async (text?: string) => {
    const messageText = text || input
    if (!messageText.trim() || loading) return

    const userMessage = { role: "user", content: messageText }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const response = await askAssistant(messageText, messages)
      setMessages(prev => [...prev, response])
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Desculpe, ocorreu um erro ao processar sua mensagem." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assistente AI</h1>
        <p className="text-muted-foreground">Utilize inteligência artificial para otimizar sua rotina.</p>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Chat Area */}
        <Card className="flex-1 flex flex-col shadow-sm border-none bg-card/50">
          <CardHeader className="border-b border-muted/50 bg-muted/20 py-3 px-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-semibold tracking-tight">Signa AI</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full" viewportRef={scrollRef}>
              <div className="p-6 space-y-6">
                {messages.map((m, i) => (
                  <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg border shadow-sm ${
                      m.role === 'assistant' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {m.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                    </div>
                    <div className={`flex flex-col gap-2 max-w-[85%] ${m.role === 'user' ? 'items-end' : ''}`}>
                      <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        m.role === 'assistant' 
                          ? 'bg-muted/50 border border-muted/20 text-foreground' 
                          : 'bg-primary text-primary-foreground shadow-md'
                      }`}>
                        {m.content}
                      </div>
                      {m.role === 'assistant' && i > 0 && !loading && (
                        <div className="flex gap-2 opacity-50 hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6" 
                            onClick={() => navigator.clipboard.writeText(m.content)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border bg-primary text-primary-foreground animate-pulse">
                      <Bot size={16} />
                    </div>
                    <div className="bg-muted/50 border border-muted/20 rounded-2xl px-4 py-3 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="text-sm text-muted-foreground italic">Signa está pensando...</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="border-t border-muted/50 p-4 bg-muted/10">
            <form 
              className="flex w-full items-center gap-3"
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            >
              <Input 
                placeholder="Como posso ajudar hoje?" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-background border-none shadow-sm h-11 px-4"
                disabled={loading}
              />
              <Button type="submit" size="icon" disabled={loading || !input.trim()} className="h-11 w-11 rounded-full shadow-lg">
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </CardFooter>
        </Card>

        {/* Suggestions Sidebar */}
        <div className="hidden lg:flex w-72 flex-col gap-4">
          <Card className="shadow-sm border-none bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sugestões</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {suggestions.map((s, i) => (
                <Button 
                  key={i} 
                  variant="ghost" 
                  className="w-full justify-start text-xs h-auto py-2.5 px-3 text-left whitespace-normal hover:bg-primary/5 hover:text-primary transition-all border border-transparent hover:border-primary/20"
                  onClick={() => handleSend(s)}
                  disabled={loading}
                >
                  {s}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-sm bg-primary/10 border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <Sparkles className="h-3 w-3" />
                Inteligência Signa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Eu tenho acesso à sua lista de pacientes e agenda. Posso gerar textos para WhatsApp ou analisar quem não comparece às sessões.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
