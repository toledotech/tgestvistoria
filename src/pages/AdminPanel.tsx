import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Building2, Plus, Pencil, Trash2 } from "lucide-react"
import { useEmpresas, type Empresa } from "@/hooks/useEmpresas"

const PLANOS = ["freemium", "básico", "profissional", "enterprise"]

export default function AdminPanel() {
  const { empresas, loading, createEmpresa, updateEmpresa, deleteEmpresa } = useEmpresas()

  const [createOpen, setCreateOpen] = useState(false)
  const [nome, setNome] = useState("")
  const [adminEmail, setAdminEmail] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [adminNome, setAdminNome] = useState("")
  const [saving, setSaving] = useState(false)

  const [editing, setEditing] = useState<Empresa | null>(null)
  const [editNome, setEditNome] = useState("")
  const [editPlano, setEditPlano] = useState("")

  const [deleteTarget, setDeleteTarget] = useState<Empresa | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleCreate = async () => {
    if (!nome.trim()) return
    setSaving(true)
    try {
      await createEmpresa(nome.trim(), adminEmail || undefined, adminPassword || undefined, adminNome || undefined)
      setCreateOpen(false)
      setNome(""); setAdminEmail(""); setAdminPassword(""); setAdminNome("")
    } finally {
      setSaving(false)
    }
  }

  const openEdit = (empresa: Empresa) => {
    setEditing(empresa)
    setEditNome(empresa.nome)
    setEditPlano(empresa.plano)
  }

  const handleEditSave = async () => {
    if (!editing || !editNome.trim()) return
    setSaving(true)
    try {
      await updateEmpresa(editing.id, { nome: editNome.trim(), plano: editPlano })
      setEditing(null)
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteEmpresa(deleteTarget.id)
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" /> Painel Admin — Empresas
          </CardTitle>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Nova Empresa
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : empresas.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Nenhuma empresa cadastrada ainda.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criada em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {empresas.map(e => (
                  <TableRow key={e.id} className="group">
                    <TableCell className="font-medium">{e.nome}</TableCell>
                    <TableCell><Badge variant="outline">{e.plano}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch checked={e.ativo} onCheckedChange={(v) => updateEmpresa(e.id, { ativo: v })} />
                        <span className="text-xs text-muted-foreground">{e.ativo ? "Ativa" : "Inativa"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{new Date(e.created_at).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(e)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(e)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Criar empresa */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova Empresa</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Nome da empresa *</Label>
              <Input value={nome} onChange={e => setNome(e.target.value)} />
            </div>
            <p className="text-xs text-muted-foreground pt-2">Opcional: já criar o usuário admin dessa empresa</p>
            <div className="space-y-1.5">
              <Label>Nome do admin</Label>
              <Input value={adminNome} onChange={e => setAdminNome(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>E-mail do admin</Label>
              <Input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Senha do admin</Label>
              <Input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={saving || !nome.trim()}>{saving ? "Criando..." : "Criar Empresa"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Editar empresa */}
      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Empresa</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Nome da empresa *</Label>
              <Input value={editNome} onChange={e => setEditNome(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Plano</Label>
              <Select value={editPlano} onValueChange={setEditPlano}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PLANOS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button onClick={handleEditSave} disabled={saving || !editNome.trim()}>{saving ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Excluir empresa */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a empresa <strong>{deleteTarget?.nome}</strong>? Essa ação é
              irreversível e apaga permanentemente todos os dados da empresa — clientes, veículos, vistorias,
              financeiro e usuários vinculados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="border border-destructive/40 bg-destructive/15 text-destructive hover:bg-destructive/25"
            >
              {deleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
