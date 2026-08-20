import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ClipboardCheck, Clock, DollarSign, AlertCircle } from "lucide-react"
import { useVistorias, tipoVistoriaLabel, statusLabel } from "@/hooks/useVistorias"

export default function Dashboard() {
  const { allOrdens, loading } = useVistorias()
  const navigate = useNavigate()

  const kpis = useMemo(() => {
    const hoje = new Date()
    const isHoje = (d: string | null) => d && new Date(d).toDateString() === hoje.toDateString()

    const vistoriasHoje = allOrdens.filter(o => isHoje(o.data_agendada))
    const pendentes = allOrdens.filter(o => o.status === 'agendada' || o.status === 'em_andamento')
    const receitaMes = allOrdens
      .filter(o => o.status_pagamento === 'pago' && new Date(o.created_at).getMonth() === hoje.getMonth())
      .reduce((s, o) => s + Number(o.valor), 0)
    const aguardandoPagamento = allOrdens.filter(o => o.status_pagamento === 'pendente' && o.status === 'concluida')

    return { vistoriasHoje, pendentes, receitaMes, aguardandoPagamento }
  }, [allOrdens])

  const recentes = allOrdens.slice(0, 8)

  if (loading) {
    return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Vistorias hoje</p>
            <p className="text-2xl font-bold">{kpis.vistoriasHoje.length}</p>
          </div>
          <ClipboardCheck className="h-8 w-8 text-primary opacity-70" />
        </CardContent></Card>
        <Card><CardContent className="pt-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Pendentes</p>
            <p className="text-2xl font-bold">{kpis.pendentes.length}</p>
          </div>
          <Clock className="h-8 w-8 text-warning opacity-70" />
        </CardContent></Card>
        <Card><CardContent className="pt-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Receita do mês</p>
            <p className="text-2xl font-bold font-mono">R$ {kpis.receitaMes.toFixed(2)}</p>
          </div>
          <DollarSign className="h-8 w-8 text-primary opacity-70" />
        </CardContent></Card>
        <Card><CardContent className="pt-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Aguardando pagamento</p>
            <p className="text-2xl font-bold">{kpis.aguardandoPagamento.length}</p>
          </div>
          <AlertCircle className="h-8 w-8 text-destructive opacity-70" />
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Vistorias Recentes</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {recentes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma vistoria cadastrada ainda.</p>
          ) : (
            recentes.map(o => (
              <div
                key={o.id}
                className="flex items-center justify-between border rounded-lg p-3 cursor-pointer hover:bg-muted/50"
                onClick={() => navigate(`/vistorias/${o.id}`)}
              >
                <div>
                  <p className="font-medium text-sm">{o.numero_protocolo} — {o.clientes?.nome}</p>
                  <p className="text-xs text-muted-foreground">{tipoVistoriaLabel[o.tipo_vistoria]}</p>
                </div>
                <Badge variant="outline">{statusLabel[o.status]}</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
