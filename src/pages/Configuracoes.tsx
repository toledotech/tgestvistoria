import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Building2, Users, Plus } from "lucide-react"
import { useConfiguracoes } from "@/hooks/useConfiguracoes"
import { useUsuariosEmpresa } from "@/hooks/useUsuariosEmpresa"
import { usePermissions, UserRole } from "@/hooks/usePermissions"
import { ChecklistTemplatesManager } from "@/components/configuracoes/ChecklistTemplatesManager"
import { PermissionGuard } from "@/components/PermissionGuard"

const roleLabel: Record<UserRole, string> = {
  super_admin: 'Super Admin', admin: 'Administrador', gerente: 'Gerente', funcionario: 'Funcionário',
}

function DadosEmpresaTab() {
  const { configuracoes, updateConfiguracoes } = useConfiguracoes()
  const [form, setForm] = useState({ nome_empresa: "", cnpj: "", endereco: "", telefone: "", email: "" })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (configuracoes) {
      setForm({
        nome_empresa: configuracoes.nome_empresa || "",
        cnpj: configuracoes.cnpj || "",
        endereco: configuracoes.endereco || "",
        telefone: configuracoes.telefone || "",
        email: configuracoes.email || "",
      })
    }
  }, [configuracoes])

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateConfiguracoes(form)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base flex items-center gap-2"><Building2 className="h-4 w-4" /> Dados da Empresa</CardTitle></CardHeader>
      <CardContent className="space-y-3 max-w-lg">
        <div className="space-y-1.5">
          <Label>Nome da empresa</Label>
          <Input value={form.nome_empresa} onChange={e => setForm({ ...form, nome_empresa: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>CNPJ</Label>
          <Input value={form.cnpj} onChange={e => setForm({ ...form, cnpj: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Endereço</Label>
          <Input value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Telefone</Label>
          <Input value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>E-mail</Label>
          <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        </div>
        <Button onClick={handleSave} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
      </CardContent>
    </Card>
  )
}

function UsuariosTab() {
  const { usuarios, criarUsuario, atualizarRole } = useUsuariosEmpresa()
  const [modalOpen, setModalOpen] = useState(false)
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<UserRole>('funcionario')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!email || !password || !nome) return
    setSaving(true)
    try {
      await criarUsuario(email, password, nome, role)
      setModalOpen(false)
      setNome(""); setEmail(""); setPassword(""); setRole('funcionario')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" /> Usuários da Empresa</CardTitle>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Novo Usuário
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Função</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.map(u => (
              <TableRow key={u.id}>
                <TableCell>{u.display_name || "—"}</TableCell>
                <TableCell className="w-56">
                  <Select value={u.role} onValueChange={(v: UserRole) => atualizarRole(u.id, v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(['admin', 'gerente', 'funcionario'] as UserRole[]).map(r => (
                        <SelectItem key={r} value={r}>{roleLabel[r]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Usuário</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5"><Label>Nome *</Label><Input value={nome} onChange={e => setNome(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>E-mail *</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Senha *</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} /></div>
            <div className="space-y-1.5">
              <Label>Função</Label>
              <Select value={role} onValueChange={(v: UserRole) => setRole(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(['admin', 'gerente', 'funcionario'] as UserRole[]).map(r => (
                    <SelectItem key={r} value={r}>{roleLabel[r]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !email || !password || !nome}>
              {saving ? "Criando..." : "Criar Usuário"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export default function Configuracoes() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <Settings className="h-5 w-5" /> Configurações
      </h2>

      <Tabs defaultValue="empresa">
        <TabsList>
          <TabsTrigger value="empresa">Empresa</TabsTrigger>
          <PermissionGuard module="configuracoes" action="write" showMessage={false}>
            <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          </PermissionGuard>
          <TabsTrigger value="checklists">Modelos de Checklist</TabsTrigger>
        </TabsList>
        <TabsContent value="empresa" className="mt-4">
          <DadosEmpresaTab />
        </TabsContent>
        <TabsContent value="usuarios" className="mt-4">
          <UsuariosTab />
        </TabsContent>
        <TabsContent value="checklists" className="mt-4">
          <ChecklistTemplatesManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}
