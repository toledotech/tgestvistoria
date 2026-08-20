import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useVistorias, tipoVistoriaLabel, statusLabel, TipoVistoria, VistoriaStatus } from "@/hooks/useVistorias"

const COLORS = ["#2563EB", "#059669", "#D97706", "#DC2626", "#7C3AED"]

export default function Relatorios() {
  const { allOrdens } = useVistorias()

  const porStatus = useMemo(() => {
    const counts: Record<string, number> = {}
    allOrdens.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1 })
    return Object.entries(counts).map(([status, total]) => ({
      status: statusLabel[status as VistoriaStatus] || status,
      total,
    }))
  }, [allOrdens])

  const porTipo = useMemo(() => {
    const counts: Record<string, number> = {}
    allOrdens.forEach(o => { counts[o.tipo_vistoria] = (counts[o.tipo_vistoria] || 0) + 1 })
    return Object.entries(counts).map(([tipo, total]) => ({
      name: tipoVistoriaLabel[tipo as TipoVistoria] || tipo,
      value: total,
    }))
  }, [allOrdens])

  const faturamento = useMemo(() => {
    const pago = allOrdens.filter(o => o.status_pagamento === 'pago').reduce((s, o) => s + Number(o.valor), 0)
    const pendente = allOrdens.filter(o => o.status_pagamento === 'pendente').reduce((s, o) => s + Number(o.valor), 0)
    return { pago, pendente }
  }, [allOrdens])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card><CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Total faturado (pago)</p>
          <p className="text-2xl font-bold font-mono text-primary">R$ {faturamento.pago.toFixed(2)}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Total em aberto</p>
          <p className="text-2xl font-bold font-mono text-warning">R$ {faturamento.pendente.toFixed(2)}</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Vistorias por Status</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porStatus}>
                <XAxis dataKey="status" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Bar dataKey="total" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Vistorias por Tipo</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={porTipo} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {porTipo.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
