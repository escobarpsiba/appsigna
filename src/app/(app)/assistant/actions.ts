"use server"

import { createClient } from "@/lib/supabase/server"

export async function askAssistant(message: string, history: any[]) {
  const supabase = await createClient()

  // 0. Buscar a clínica do usuário logado para segurança
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, name')
    .eq('id', user?.id)
    .single()

  const tenantId = profile?.tenant_id
  const userName = profile?.name || "Psicanalista"

  const { data: tenant } = await supabase
    .from('tenants')
    .select('name, ai_knowledge_base')
    .eq('id', tenantId)
    .single()

  const knowledgeBase = tenant?.ai_knowledge_base || ""

  // 1. Coletar Contexto do Banco de Dados (Filtrado por Clínica)
  const { data: patients } = await supabase
    .from('patients')
    .select('name, price, frequency, active')
    .eq('tenant_id', tenantId)

  const { data: appointments } = await supabase
    .from('appointments')
    .select('starts_at, status, modality, patients(name)')
    .eq('tenant_id', tenantId)
    .limit(10)

  const { data: payments } = await supabase
    .from('payments')
    .select('amount, status, paid_at')
    .eq('tenant_id', tenantId)
    .limit(10)

  const context = `
    Você é o assistente da plataforma Signa, um sistema premium para psicanalistas no Brasil.
    Você está conversando com: ${userName}.
    Sua personalidade: discreto, inteligente, elegante, minimalista e calmo.
    Seu objetivo: ajudar o psicanalista a gerenciar sua clínica de forma eficiente.
    
    DADOS REAIS DA CLÍNICA DE ${userName}:
    - Pacientes: ${JSON.stringify(patients)}
    - Próximas Sessões: ${JSON.stringify(appointments)}
    - Pagamentos Recentes: ${JSON.stringify(payments)}
    ${knowledgeBase ? `
    INSTRUÇÕES PERSONALIZADAS DO PROFISSIONAL (priorize estas orientações):
    ${knowledgeBase}
    ` : ''}
    
    REGRAS:
    - Responda sempre em Português do Brasil.
    - Se o usuário pedir para gerar uma mensagem (cobrança, confirmação), seja extremamente cordial e elegante.
    ${knowledgeBase ? '- Siga as instruções personalizadas definidas pelo profissional acima.' : ''}
    - Use os dados acima para responder perguntas específicas.
    - Não invente dados.
    - Seja conciso.
  `

  const apiKey = process.env.GOOGLE_GEMINI_API_KEY

  if (!apiKey) {
    return { 
      role: "assistant", 
      content: "A chave da API do Gemini não foi encontrada no ambiente. Verifique o arquivo .env.local."
    }
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: context }] },
          ...history.slice(-5).map(h => ({
            role: h.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: h.content }]
          })),
          { role: 'user', parts: [{ text: message }] }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        }
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Erro API Gemini:", errorData)
      return { role: "assistant", content: "Ocorreu um erro na comunicação com a IA do Google. Tente novamente em instantes." }
    }

    const data = await response.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "Não consegui gerar uma resposta agora."

    return { role: "assistant", content }
  } catch (err) {
    console.error("Erro Crítico Assistente:", err)
    return { role: "assistant", content: "Erro de conexão com o servidor de IA." }
  }
}
