import { useParams, useNavigate } from "@tanstack/react-router"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, ClipboardCheck } from "lucide-react"
import { useVistoria, useVistorias, VistoriaStatus, tipoVistoriaLabel, statusLabel } from "@/hooks/useVistorias"
import { ChecklistPanel } from "@/components/vistorias/ChecklistPanel"
import { CobrancaPanel } from "@/components/vistorias/CobrancaPanel"

export default function VistoriaDetalhe() {
  const { id } = useParams({ from: "/_authenticated/vistorias/$id" })
  const navigate = useNavigate()
  const { ordem, loading, refetch } = useVistoria(id)
  const { updateOrdem } = useVistorias()

  const handleStatusChange = async (status: VistoriaStatus) => {
    if (!ordem) return
    await updateOrdem({ id: ordem.id, status })
    refetch()
  }

  if (loading) {
    return <Skeleton className="h-96 w-full" />
  }

  if (!ordem) {
    return <div className="text-center py-12 text-muted-foreground">Vistoria não encontrada.</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/vistorias' })}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" /> Vistoria {ordem.numero_protocolo}
          </h2>
          <p className="text-sm text-muted-foreground">{tipoVistoriaLabel[ordem.tipo_vistoria]}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Dados da Ordem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">Cliente:</span> {ordem.clientes?.nome || "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Veículo:</span>{" "}
              {[ordem.veiculos?.placa, ordem.veiculos?.marca, ordem.veiculos?.modelo].filter(Boolean).join(" - ") || "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Valor:</span> R$ {Number(ordem.valor).toFixed(2)}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Pagamento:</span>
              <Badge variant={ordem.status_pagamento === 'pago' ? 'default' : 'outline'}>
                {ordem.status_pagamento === 'pago' ? 'Pago' : ordem.status_pagamento === 'cancelado' ? 'Cancelado' : 'Pendente'}
              </Badge>
            </div>
            <div className="space-y-1.5 pt-2">
              <span className="text-muted-foreground text-xs uppercase tracking-wide">Status da vistoria</span>
              <Select value={ordem.status} onValueChange={(v: VistoriaStatus) => handleStatusChange(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(statusLabel) as VistoriaStatus[]).map(s => (
                    <SelectItem key={s} value={s}>{statusLabel[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {ordem.observacoes && (
              <div>
                <span className="text-muted-foreground">Observações:</span>
                <p>{ordem.observacoes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <ChecklistPanel ordem={ordem} />
          <CobrancaPanel ordem={ordem} onPaid={refetch} />
        </div>
      </div>
    </div>
  )
}
