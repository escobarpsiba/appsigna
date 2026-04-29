import { useState } from 'react'

export default function Assistant() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim()) return
    
    const userMessage = { role: 'user', content: input }
    setMessages([...messages, userMessage])
    setInput('')
    setLoading(true)

    // Simulação de resposta - integrar com API de IA posteriormente
    setTimeout(() => {
      const assistantMessage = { 
        role: 'assistant', 
        content: 'Esta é uma versão básica do assistente. Configure a API do Gemini para funcionalidades completas.' 
      }
      setMessages(prev => [...prev, assistantMessage])
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="p-6 h-[calc(100vh-100px)] flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Assistente IA</h1>
      <div className="flex-1 bg-white rounded-lg shadow p-4 overflow-y-auto mb-4">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center">Digite uma mensagem para começar</p>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
              <span className={`inline-block px-3 py-2 rounded ${
                msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                {msg.content}
              </span>
            </div>
          ))
        )}
        {loading && <p className="text-gray-500">Digitando...</p>}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Digite sua mensagem..."
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Enviar
        </button>
      </div>
    </div>
  )
}