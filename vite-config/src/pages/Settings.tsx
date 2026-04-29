import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function Settings() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (loading) return <div>Carregando...</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>
      <div className="bg-white rounded-lg shadow p-6 max-w-md">
        <div className="mb-4">
          <label className="block text-sm text-gray-500">Email</label>
          <p className="font-medium">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Sair
        </button>
      </div>
    </div>
  )
}