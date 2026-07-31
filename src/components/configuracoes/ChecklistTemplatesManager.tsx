import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, ClipboardList } from "lucide-react"
import { useChecklistTemplates, ChecklistItem, TipoResposta } from "@/hooks/useChecklistTemplates"
import { tipoVistoriaLabel, TipoVistoria } from "@/hooks/useVistorias"

const respostaLabel: Record<TipoResposta, string> = {
  ok_nao_na: 'OK / Não OK / N/A',
  texto: 'Texto livre',
  numero: 'Número',
}

export function ChecklistTemplatesManager() {
  const { templates, createTemplate, updateTemplate, deleteTemplate } = useChecklistTemplates()

  const [novoNome, setNovoNome] = useState("")
  const [novoTipo, setNovoTipo] = useState<TipoVistoria>('seguradora')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleCriar = async () => {
    if (!novoNome.trim()) return
    const created = await createTemplate(novoTipo, novoNome.trim())
    setNovoNome("")
    if (created) setExpandedId((created as any).id)
  }

  const addItem = (templateId: string, itens: ChecklistItem[]) => {
    const novoItem: ChecklistItem = {
      id: crypto.randomUUID(),
      label: "Novo item",
      tipo_resposta: 'ok_nao_na',
      aceita_foto: true,
      ordem: itens.length,
    }
    updateTemplate(templateId, { itens: [...itens, novoItem] })
  }

  const updateItem = (templateId: string, itens: ChecklistItem[], itemId: string, changes: Partial<ChecklistItem>) => {
    const novosItens = itens.map(i => (i.id === itemId ? { ...i, ...changes } : i))
    updateTemplate(templateId, { itens: novosItens })
  }

  const removeItem = (templateId: string, itens: ChecklistItem[], itemId: string) => {
    updateTemplate(templateId, { itens: itens.filter(i => i.id !== itemId) })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardList className="h-4 w-4" /> Modelos de Checklist
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end gap-2 border-b pb-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Tipo de vistoria</Label>
            <Select value={novoTipo} onValueChange={(v: TipoVistoria) => setNovoTipo(v)}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(tipoVistoriaLabel) as TipoVistoria[]).map(t => (
                  <SelectItem key={t} value={t}>{tipoVistoriaLabel[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 flex-1 min-w-[200px]">
            <Label className="text-xs">Nome do modelo</Label>
            <Input placeholder="Ex: Checklist Seguradora Padrão" value={novoNome} onChange={e => setNovoNome(e.target.value)} />
          </div>
          <Button onClick={handleCriar} disabled={!novoNome.trim()}>
            <Plus className="h-4 w-4 mr-2" /> Novo Modelo
          </Button>
        </div>

        {templates.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum modelo de checklist criado ainda.</p>
        ) : (
          <div className="space-y-3">
            {templates.map((template) => (
              <div key={template.id} className="border rounded-lg">
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-3 text-left"
                  onClick={() => setExpandedId(expandedId === template.id ? null : template.id)}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{template.nome}</span>
                    <Badge variant="outline">{tipoVistoriaLabel[template.tipo_vistoria]}</Badge>
                    {!template.ativo && <Badge variant="secondary">Inativo</Badge>}
                  </div>
                  <span className="text-xs text-muted-foreground">{template.itens.length} itens</span>
                </button>

                {expandedId === template.id && (
                  <div className="p-3 pt-0 space-y-3 border-t">
                    <div className="flex items-center gap-2 pt-3">
                      <Switch
                        checked={template.ativo}
                        onCheckedChange={(v) => updateTemplate(template.id, { ativo: v })}
                      />
                      <span className="text-sm">Modelo ativo</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto text-destructive"
                        onClick={() => deleteTemplate(template.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Excluir modelo
                      </Button>
                    </div>

                    {template.itens.map((item) => (
                      <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                        <Input
                          className="col-span-5"
                          value={item.label}
                          onChange={(e) => updateItem(template.id, template.itens, item.id, { label: e.target.value })}
                        />
                        <Select
                          value={item.tipo_resposta}
                          onValueChange={(v: TipoResposta) => updateItem(template.id, template.itens, item.id, { tipo_resposta: v })}
                        >
                          <SelectTrigger className="col-span-4"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {(Object.keys(respostaLabel) as TipoResposta[]).map(r => (
                              <SelectItem key={r} value={r}>{respostaLabel[r]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="col-span-2 flex items-center gap-1.5">
                          <Switch
                            checked={item.aceita_foto}
                            onCheckedChange={(v) => updateItem(template.id, template.itens, item.id, { aceita_foto: v })}
                          />
                          <span className="text-xs text-muted-foreground">Foto</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="col-span-1"
                          onClick={() => removeItem(template.id, template.itens, item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}

                    <Button variant="outline" size="sm" onClick={() => addItem(template.id, template.itens)}>
                      <Plus className="h-4 w-4 mr-2" /> Adicionar item
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
