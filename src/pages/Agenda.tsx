import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, Plus, Trash2, ClipboardCheck } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useCompromissos } from "@/hooks/useCompromissos"
import { useVistorias } from "@/hooks/useVistorias"

type AgendaItem = {
  id: string
  titulo: string
  data_hora: string
  tipo: 'compromisso' | 'vistoria'
  vistoriaId?: string
}

export default function Agenda() {
  const { compromissos, loading: loadingCompromissos, createCompromisso, deleteCompromisso } = useCompromissos()
  const { allOrdens, loading: loadingOrdens } = useVistorias()
  const navigate = useNavigate()

  const [modalOpen, setModalOpen] = useState(false)
  const [titulo, setTitulo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [dataHora, setDataHora] = useState("")
  const [saving, setSaving] = useState(false)

  const itens: AgendaItem[] = useMemo(() => {
    const doCompromissos: AgendaItem[] = compromissos.map(c => ({
      id: c.id, titulo: c.titulo, data_hora: c.data_hora, tipo: 'compromisso',
    }))
    const dasVistorias: AgendaItem[] = allOrdens
      .filter(o => o.data_agendada)
      .map(o => ({
        id: o.id,
        titulo: `Vistoria ${o.numero_protocolo} — ${o.clientes?.nome || ''}`,
        data_hora: o.data_agendada as string,
        tipo: 'vistoria',
        vistoriaId: o.id,
      }))
    return [...doCompromissos, ...dasVistorias].sort((a, b) => a.data_hora.localeCompare(b.data_hora))
  }, [compromissos, allOrdens])

  const handleSave = async () => {
    if (!titulo.trim() || !dataHora) return
    setSaving(true)
    try {
      await createCompromisso({ titulo: titulo.trim(), descricao, data_hora: new Date(dataHora).toISOString() })
      setModalOpen(false)
      setTitulo(""); setDescricao(""); setDataHora("")
    } finally {
      setSaving(false)
    }
  }

  const loading = loadingCompromissos || loadingOrdens

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" /> Agenda
          </CardTitle>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Novo Compromisso
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : itens.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Nenhum compromisso ou vistoria agendada.</div>
          ) : (
            itens.map(item => (
              <div
                key={`${item.tipo}-${item.id}`}
                className={`flex items-center justify-between border rounded-lg p-3 ${item.tipo === 'vistoria' ? 'cursor-pointer hover:bg-muted/50' : ''}`}
                onClick={() => item.tipo === 'vistoria' && navigate(`/vistorias/${item.vistoriaId}`)}
              >
                <div className="flex items-center gap-3">
                  {item.tipo === 'vistoria' ? <ClipboardCheck className="h-4 w-4 text-primary" /> : <Calendar className="h-4 w-4 text-muted-foreground" />}
                  <div>
                    <p className="font-medium text-sm">{item.titulo}</p>
                    <p className="text-xs text-muted-foreground">{new Date(item.data_hora).toLocaleString('pt-BR')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{item.tipo === 'vistoria' ? 'Vistoria' : 'Compromisso'}</Badge>
                  {item.tipo === 'compromisso' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.stopPropagation(); deleteCompromisso(item.id) }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Compromisso</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Título *</Label>
              <Input value={titulo} onChange={e => setTitulo(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Data e hora *</Label>
              <Input type="datetime-local" value={dataHora} onChange={e => setDataHora(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Input value={descricao} onChange={e => setDescricao(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !titulo.trim() || !dataHora}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
