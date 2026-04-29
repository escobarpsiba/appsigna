import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

interface Payment {
  id: string
  patient_name: string
  amount: number
  date: string
  status: string
}

export default function Financial() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('date', { ascending: false })
    if (!error && data) {
      setPayments(data)
      setTotal(data.reduce((sum, p) => sum + (p.status === 'paid' ? p.amount : 0), 0))
    }
    setLoading(false)
  }

  if (loading) return <div>Carregando...</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Financeiro</h1>
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <p className="text-gray-500 text-sm">Total Recebido</p>
        <p className="text-3xl font-bold">R$ {total.toFixed(2)}</p>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Paciente</th>
              <th className="px-4 py-2 text-left">Valor</th>
              <th className="px-4 py-2 text-left">Data</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-t">
                <td className="px-4 py-2">{payment.patient_name}</td>
                <td className="px-4 py-2">R$ {payment.amount.toFixed(2)}</td>
                <td className="px-4 py-2">{payment.date}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      payment.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {payment.status === 'paid' ? 'Pago' : 'Pendente'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}