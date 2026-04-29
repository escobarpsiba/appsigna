import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

interface Appointment {
  id: string
  patient_name: string
  date: string
  time: string
  status: string
}

export default function Calendar() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: true })
    if (!error && data) setAppointments(data)
    setLoading(false)
  }

  if (loading) return <div>Carregando...</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Agenda</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Nova Consulta
        </button>
      </div>
      <div className="bg-white rounded-lg shadow">
        {appointments.length === 0 ? (
          <p className="p-4 text-gray-500">Nenhuma consulta agendada</p>
        ) : (
          <div className="divide-y">
            {appointments.map((apt) => (
              <div key={apt.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{apt.patient_name}</p>
                  <p className="text-sm text-gray-500">
                    {apt.date} às {apt.time}
                  </p>
                </div>
                <span className="px-2 py-1 text-xs rounded bg-gray-100">
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}