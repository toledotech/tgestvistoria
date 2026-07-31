import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, ExternalLink } from "lucide-react"
import { usePagamento } from "@/hooks/usePagamentos"
import type { OrdemVistoria } from "@/hooks/useVistorias"

interface CobrancaPanelProps {
  ordem: OrdemVistoria
  onPaid?: () => void
}

const statusBadge: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  approved: { label: "Pago", variant: "default" },
  pending: { label: "Aguardando pagamento", variant: "secondary" },
  in_process: { label: "Em processamento", variant: "secondary" },
  rejected: { label: "Recusado", variant: "destructive" },
}

export function CobrancaPanel({ ordem }: CobrancaPanelProps) {
  const { pagamento, loading, gerando, gerarCobranca } = usePagamento(ordem.id)

  const badge = pagamento ? statusBadge[pagamento.status] || { label: pagamento.status, variant: 'outline' as const } : null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base flex items-center gap-2">
          <CreditCard className="h-4 w-4" /> Cobrança
        </CardTitle>
        {badge && <Badge variant={badge.variant}>{badge.label}</Badge>}
      </CardHeader>
      <CardContent className="space-y-3">
        {ordem.status_pagamento === 'pago' ? (
          <p className="text-sm text-muted-foreground">Esta vistoria já está paga.</p>
        ) : loading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : pagamento?.link_pagamento ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Cobrança de R$ {Number(pagamento.valor).toFixed(2)} gerada via Mercado Pago (Pix ou cartão).
            </p>
            <Button asChild variant="outline">
              <a href={pagamento.link_pagamento} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" /> Abrir link de pagamento
              </a>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Nenhuma cobrança gerada ainda para esta vistoria (R$ {Number(ordem.valor).toFixed(2)}).
            </p>
            <Button onClick={gerarCobranca} disabled={gerando}>
              {gerando ? "Gerando..." : "Gerar cobrança (Pix/Cartão)"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
