import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Building2, Plus } from "lucide-react"
import { useEmpresas } from "@/hooks/useEmpresas"

export default function AdminPanel() {
  const { empresas, loading, createEmpresa, updateEmpresa } = useEmpresas()
  const [modalOpen, setModalOpen] = useState(false)
  const [nome, setNome] = useState("")
  const [adminEmail, setAdminEmail] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [adminNome, setAdminNome] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!nome.trim()) return
    setSaving(true)
    try {
      await createEmpresa(nome.trim(), adminEmail || undefined, adminPassword || undefined, adminNome || undefined)
      setModalOpen(false)
      setNome(""); setAdminEmail(""); setAdminPassword(""); setAdminNome("")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" /> Painel Admin — Empresas
          </CardTitle>
          <Button onClick={() => setModalOpen(true)}>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {empresas.map(e => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.nome}</TableCell>
                    <TableCell><Badge variant="outline">{e.plano}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch checked={e.ativo} onCheckedChange={(v) => updateEmpresa(e.id, { ativo: v })} />
                        <span className="text-xs text-muted-foreground">{e.ativo ? "Ativa" : "Inativa"}</span>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(e.created_at).toLocaleDateString('pt-BR')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
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
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !nome.trim()}>{saving ? "Criando..." : "Criar Empresa"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
