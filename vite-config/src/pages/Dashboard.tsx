import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/login'
    } else {
      setLoading(false)
    }
  }

  if (loading) return <div>Carregando...</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Pacientes</h3>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Consultas Hoje</h3>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Faturamento</h3>
          <p className="text-2xl font-bold">R$ 0</p>
        </div>
      </div>
    </div>
  )
}