import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ClipboardCheck, Plus, Search } from "lucide-react"
import { useVistorias, CreateOrdemVistoriaData, tipoVistoriaLabel, statusLabel, VistoriaStatus } from "@/hooks/useVistorias"
import { useClientes } from "@/hooks/useClientes"
import { useVeiculos } from "@/hooks/useVeiculos"
import { PermissionGuard } from "@/components/PermissionGuard"

const emptyForm: CreateOrdemVistoriaData = {
  tipo_vistoria: 'seguradora',
  cliente_id: '',
  veiculo_id: '',
  valor: 0,
  observacoes: '',
}

const statusVariant: Record<VistoriaStatus, "default" | "secondary" | "destructive" | "outline"> = {
  agendada: 'outline',
  em_andamento: 'secondary',
  concluida: 'default',
  cancelada: 'destructive',
}

export default function Vistorias() {
  const { ordens, loading, searchTerm, setSearchTerm, createOrdem } = useVistorias()
  const { allClientes } = useClientes()
  const { allVeiculos } = useVeiculos()
  const navigate = useNavigate()

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<CreateOrdemVistoriaData>(emptyForm)
  const [saving, setSaving] = useState(false)

  const veiculosDoCliente = allVeiculos.filter(v => v.cliente_id === form.cliente_id)

  const handleSave = async () => {
    if (!form.cliente_id || !form.veiculo_id) return
    setSaving(true)
    try {
      const created = await createOrdem(form)
      setModalOpen(false)
      setForm(emptyForm)
      if (created) navigate(`/vistorias/${(created as any).id}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" /> Vistorias
          </CardTitle>
          <PermissionGuard module="vistorias" action="write" showMessage={false}>
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Nova Vistoria
            </Button>
          </PermissionGuard>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por protocolo, cliente ou placa..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : ordens.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchTerm ? "Nenhuma vistoria encontrada." : "Nenhuma vistoria cadastrada ainda."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Protocolo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordens.map((ordem) => (
                  <TableRow
                    key={ordem.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/vistorias/${ordem.id}`)}
                  >
                    <TableCell className="font-medium">{ordem.numero_protocolo}</TableCell>
                    <TableCell>{tipoVistoriaLabel[ordem.tipo_vistoria]}</TableCell>
                    <TableCell>{ordem.clientes?.nome || "—"}</TableCell>
                    <TableCell>{ordem.veiculos?.placa || "—"}</TableCell>
                    <TableCell><Badge variant={statusVariant[ordem.status]}>{statusLabel[ordem.status]}</Badge></TableCell>
                    <TableCell>
                      <Badge variant={ordem.status_pagamento === 'pago' ? 'default' : 'outline'}>
                        {ordem.status_pagamento === 'pago' ? 'Pago' : ordem.status_pagamento === 'cancelado' ? 'Cancelado' : 'Pendente'}
                      </Badge>
                    </TableCell>
                    <TableCell>R$ {Number(ordem.valor).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova Ordem de Vistoria</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="col-span-2 space-y-1.5">
              <Label>Tipo de vistoria *</Label>
              <Select value={form.tipo_vistoria} onValueChange={(v: any) => setForm({ ...form, tipo_vistoria: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="seguradora">Seguradora</SelectItem>
                  <SelectItem value="detran">DETRAN</SelectItem>
                  <SelectItem value="tecnica_engenharia">Técnica/Engenharia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Cliente *</Label>
              <Select value={form.cliente_id} onValueChange={(v) => setForm({ ...form, cliente_id: v, veiculo_id: '' })}>
                <SelectTrigger><SelectValue placeholder="Selecione um cliente" /></SelectTrigger>
                <SelectContent>
                  {allClientes.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Veículo *</Label>
              <Select value={form.veiculo_id} onValueChange={(v) => setForm({ ...form, veiculo_id: v })} disabled={!form.cliente_id}>
                <SelectTrigger><SelectValue placeholder="Selecione um veículo" /></SelectTrigger>
                <SelectContent>
                  {veiculosDoCliente.map(v => (
                    <SelectItem key={v.id} value={v.id}>
                      {[v.placa, v.marca, v.modelo].filter(Boolean).join(' - ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.valor ?? 0}
                onChange={e => setForm({ ...form, valor: Number(e.target.value) })}
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Observações</Label>
              <Input value={form.observacoes || ""} onChange={e => setForm({ ...form, observacoes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !form.cliente_id || !form.veiculo_id}>
              {saving ? "Criando..." : "Criar Vistoria"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
