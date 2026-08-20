import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Car, Plus, Pencil, Trash2, Search } from "lucide-react"
import { useVeiculos, Veiculo, CreateVeiculoData } from "@/hooks/useVeiculos"
import { useClientes } from "@/hooks/useClientes"
import { PermissionGuard } from "@/components/PermissionGuard"

const emptyForm: CreateVeiculoData = {
  cliente_id: null, marca: "", modelo: "", ano: null, placa: "", chassi: "", renavam: "", cor: "", observacoes: ""
}

export default function Veiculos() {
  const { veiculos, loading, searchTerm, setSearchTerm, createVeiculo, updateVeiculo, deleteVeiculo } = useVeiculos()
  const { allClientes } = useClientes()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Veiculo | null>(null)
  const [form, setForm] = useState<CreateVeiculoData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const clienteNome = (id: string | null) => allClientes.find(c => c.id === id)?.nome || "—"

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (veiculo: Veiculo) => {
    setEditing(veiculo)
    setForm({
      cliente_id: veiculo.cliente_id,
      marca: veiculo.marca || "",
      modelo: veiculo.modelo || "",
      ano: veiculo.ano,
      placa: veiculo.placa || "",
      chassi: veiculo.chassi || "",
      renavam: veiculo.renavam || "",
      cor: veiculo.cor || "",
      observacoes: veiculo.observacoes || "",
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editing) {
        await updateVeiculo({ id: editing.id, ...form })
      } else {
        await createVeiculo(form)
      }
      setModalOpen(false)
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (deleteId) {
      await deleteVeiculo(deleteId)
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" /> Veículos
          </CardTitle>
          <PermissionGuard module="veiculos" action="write" showMessage={false}>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" /> Novo Veículo
            </Button>
          </PermissionGuard>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por placa, marca, modelo ou chassi..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : veiculos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchTerm ? "Nenhum veículo encontrado." : "Nenhum veículo cadastrado ainda."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Placa</TableHead>
                  <TableHead>Marca/Modelo</TableHead>
                  <TableHead>Ano</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {veiculos.map((veiculo) => (
                  <TableRow key={veiculo.id}>
                    <TableCell className="font-medium">{veiculo.placa || "—"}</TableCell>
                    <TableCell>{[veiculo.marca, veiculo.modelo].filter(Boolean).join(" ") || "—"}</TableCell>
                    <TableCell>{veiculo.ano || "—"}</TableCell>
                    <TableCell>{clienteNome(veiculo.cliente_id)}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(veiculo)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <PermissionGuard module="veiculos" action="delete" showMessage={false}>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(veiculo.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </PermissionGuard>
                    </TableCell>
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
            <DialogTitle>{editing ? "Editar Veículo" : "Novo Veículo"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="col-span-2 space-y-1.5">
              <Label>Cliente</Label>
              <Select value={form.cliente_id || ""} onValueChange={(v) => setForm({ ...form, cliente_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione um cliente" /></SelectTrigger>
                <SelectContent>
                  {allClientes.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Placa</Label>
              <Input value={form.placa || ""} onChange={e => setForm({ ...form, placa: e.target.value.toUpperCase() })} />
            </div>
            <div className="space-y-1.5">
              <Label>Ano</Label>
              <Input type="number" value={form.ano ?? ""} onChange={e => setForm({ ...form, ano: e.target.value ? Number(e.target.value) : null })} />
            </div>
            <div className="space-y-1.5">
              <Label>Marca</Label>
              <Input value={form.marca || ""} onChange={e => setForm({ ...form, marca: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Modelo</Label>
              <Input value={form.modelo || ""} onChange={e => setForm({ ...form, modelo: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Chassi</Label>
              <Input value={form.chassi || ""} onChange={e => setForm({ ...form, chassi: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Renavam</Label>
              <Input value={form.renavam || ""} onChange={e => setForm({ ...form, renavam: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Cor</Label>
              <Input value={form.cor || ""} onChange={e => setForm({ ...form, cor: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este veículo? Veículos com ordens de vistoria associadas não podem ser excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="border border-destructive/40 bg-destructive/15 text-destructive hover:bg-destructive/25">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
