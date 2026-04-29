import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

interface Patient {
  id: string
  name: string
  email: string
  phone: string
}

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    const { data, error } = await supabase.from('patients').select('*')
    if (!error && data) setPatients(data)
    setLoading(false)
  }

  if (loading) return <div>Carregando...</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pacientes</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Novo Paciente
        </button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Nome</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Telefone</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient.id} className="border-t">
                <td className="px-4 py-2">{patient.name}</td>
                <td className="px-4 py-2">{patient.email}</td>
                <td className="px-4 py-2">{patient.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}