import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ClipboardList, Camera, Check } from "lucide-react"
import { useChecklistTemplates } from "@/hooks/useChecklistTemplates"
import { useChecklistResposta, RespostaItem } from "@/hooks/useChecklistRespostas"
import type { OrdemVistoria } from "@/hooks/useVistorias"
import { LaudoPdfButton } from "@/components/vistorias/LaudoPdfButton"

interface ChecklistPanelProps {
  ordem: OrdemVistoria
}

export function ChecklistPanel({ ordem }: ChecklistPanelProps) {
  const { templates, loading: templatesLoading } = useChecklistTemplates()

  const template = useMemo(() => {
    if (ordem.checklist_template_id) {
      return templates.find(t => t.id === ordem.checklist_template_id) || null
    }
    return templates.find(t => t.tipo_vistoria === ordem.tipo_vistoria && t.ativo) || null
  }, [templates, ordem.checklist_template_id, ordem.tipo_vistoria])

  const { resposta, loading: respostaLoading, salvarRespostas, uploadFoto, concluirChecklist } =
    useChecklistResposta(ordem.id, template?.id)

  const [respostas, setRespostas] = useState<Record<string, RespostaItem>>({})
  const [saving, setSaving] = useState(false)
  const [uploadingItem, setUploadingItem] = useState<string | null>(null)

  useEffect(() => {
    if (resposta) setRespostas(resposta.respostas || {})
  }, [resposta])

  const setValor = (itemId: string, valor: RespostaItem['valor']) => {
    setRespostas(prev => ({ ...prev, [itemId]: { valor, fotos: prev[itemId]?.fotos || [] } }))
  }

  const handleUploadFoto = async (itemId: string, file: File) => {
    setUploadingItem(itemId)
    try {
      const path = await uploadFoto(file)
      setRespostas(prev => ({
        ...prev,
        [itemId]: { valor: prev[itemId]?.valor ?? null, fotos: [...(prev[itemId]?.fotos || []), path] }
      }))
    } finally {
      setUploadingItem(null)
    }
  }

  const handleSalvar = async () => {
    setSaving(true)
    try {
      await salvarRespostas(respostas)
    } finally {
      setSaving(false)
    }
  }

  if (templatesLoading || respostaLoading) {
    return <Skeleton className="h-48 w-full" />
  }

  if (!template) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><ClipboardList className="h-4 w-4" /> Checklist</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Nenhum modelo de checklist ativo para este tipo de vistoria. Configure um em
          Configurações → Modelos de Checklist.
        </CardContent>
      </Card>
    )
  }

  const itens = [...template.itens].sort((a, b) => a.ordem - b.ordem)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base flex items-center gap-2">
          <ClipboardList className="h-4 w-4" /> Checklist — {template.nome}
        </CardTitle>
        {resposta?.concluido_em && <Badge>Concluído</Badge>}
      </CardHeader>
      <CardContent className="space-y-4">
        {itens.length === 0 ? (
          <p className="text-sm text-muted-foreground">Este modelo ainda não tem itens configurados.</p>
        ) : (
          itens.map((item) => (
            <div key={item.id} className="border rounded-lg p-3 space-y-2">
              <Label>{item.label}</Label>

              {item.tipo_resposta === 'ok_nao_na' && (
                <div className="flex gap-2">
                  {['OK', 'Não OK', 'N/A'].map(opt => (
                    <Button
                      key={opt}
                      type="button"
                      size="sm"
                      variant={respostas[item.id]?.valor === opt ? 'default' : 'outline'}
                      onClick={() => setValor(item.id, opt)}
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
              )}

              {item.tipo_resposta === 'texto' && (
                <Input
                  value={(respostas[item.id]?.valor as string) || ''}
                  onChange={(e) => setValor(item.id, e.target.value)}
                />
              )}

              {item.tipo_resposta === 'numero' && (
                <Input
                  type="number"
                  value={(respostas[item.id]?.valor as number) ?? ''}
                  onChange={(e) => setValor(item.id, e.target.value ? Number(e.target.value) : null)}
                />
              )}

              {item.aceita_foto && (
                <div className="flex items-center gap-2 pt-1">
                  <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                    <Camera className="h-3.5 w-3.5" />
                    {uploadingItem === item.id ? "Enviando..." : "Anexar foto"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleUploadFoto(item.id, e.target.files[0])}
                    />
                  </label>
                  {(respostas[item.id]?.fotos?.length || 0) > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {respostas[item.id].fotos.length} foto(s) anexada(s)
                    </span>
                  )}
                </div>
              )}
            </div>
          ))
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-2">
            <Button onClick={handleSalvar} disabled={saving} variant="outline">
              {saving ? "Salvando..." : "Salvar Checklist"}
            </Button>
            {!resposta?.concluido_em && (
              <Button onClick={() => concluirChecklist()}>
                <Check className="h-4 w-4 mr-2" /> Concluir
              </Button>
            )}
          </div>
          {resposta?.concluido_em && (
            <LaudoPdfButton ordem={ordem} template={template} resposta={{ ...resposta, respostas }} />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
