import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, Plus, Pencil, Trash2, Search } from "lucide-react"
import { useClientes, Cliente, CreateClienteData } from "@/hooks/useClientes"
import { PermissionGuard } from "@/components/PermissionGuard"

const emptyForm: CreateClienteData = {
  nome: "", cpf_cnpj: "", email: "", telefone: "", endereco: "", cidade: "", estado: "", cep: "", observacoes: ""
}

export default function Clientes() {
  const { clientes, loading, searchTerm, setSearchTerm, createCliente, updateCliente, deleteCliente } = useClientes()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Cliente | null>(null)
  const [form, setForm] = useState<CreateClienteData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (cliente: Cliente) => {
    setEditing(cliente)
    setForm({
      nome: cliente.nome,
      cpf_cnpj: cliente.cpf_cnpj || "",
      email: cliente.email || "",
      telefone: cliente.telefone || "",
      endereco: cliente.endereco || "",
      cidade: cliente.cidade || "",
      estado: cliente.estado || "",
      cep: cliente.cep || "",
      observacoes: cliente.observacoes || "",
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.nome.trim()) return
    setSaving(true)
    try {
      if (editing) {
        await updateCliente({ id: editing.id, ...form })
      } else {
        await createCliente(form)
      }
      setModalOpen(false)
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (deleteId) {
      await deleteCliente(deleteId)
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> Clientes
          </CardTitle>
          <PermissionGuard module="clientes" action="write" showMessage={false}>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" /> Novo Cliente
            </Button>
          </PermissionGuard>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, CPF/CNPJ, e-mail ou telefone..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : clientes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchTerm ? "Nenhum cliente encontrado." : "Nenhum cliente cadastrado ainda."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF/CNPJ</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell className="font-medium">{cliente.nome}</TableCell>
                    <TableCell>{cliente.cpf_cnpj || "—"}</TableCell>
                    <TableCell>{cliente.telefone || "—"}</TableCell>
                    <TableCell>{cliente.email || "—"}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(cliente)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <PermissionGuard module="clientes" action="delete" showMessage={false}>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(cliente.id)}>
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
            <DialogTitle>{editing ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="col-span-2 space-y-1.5">
              <Label>Nome *</Label>
              <Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>CPF/CNPJ</Label>
              <Input value={form.cpf_cnpj || ""} onChange={e => setForm({ ...form, cpf_cnpj: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Telefone</Label>
              <Input value={form.telefone || ""} onChange={e => setForm({ ...form, telefone: e.target.value })} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>E-mail</Label>
              <Input type="email" value={form.email || ""} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Endereço</Label>
              <Input value={form.endereco || ""} onChange={e => setForm({ ...form, endereco: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Cidade</Label>
              <Input value={form.cidade || ""} onChange={e => setForm({ ...form, cidade: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Estado</Label>
              <Input value={form.estado || ""} onChange={e => setForm({ ...form, estado: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>CEP</Label>
              <Input value={form.cep || ""} onChange={e => setForm({ ...form, cep: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !form.nome.trim()}>
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
              Tem certeza que deseja excluir este cliente? Clientes com ordens de vistoria associadas não podem ser excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
