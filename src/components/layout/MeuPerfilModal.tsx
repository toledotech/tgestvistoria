import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/useAuth'
import { usePermissions } from '@/hooks/usePermissions'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { User, Lock, Mail } from 'lucide-react'

interface MeuPerfilModalProps {
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function MeuPerfilModal({ open, onOpenChange }: MeuPerfilModalProps) {
  const { user, updatePassword } = useAuth()
  const { userProfile, refetch } = usePermissions()
  const { toast } = useToast()

  const [displayName, setDisplayName] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [savingNome, setSavingNome] = useState(false)
  const [savingSenha, setSavingSenha] = useState(false)

  useEffect(() => {
    if (open && userProfile) {
      setDisplayName(userProfile.display_name || '')
      setNovaSenha('')
      setConfirmarSenha('')
    }
  }, [open, userProfile])

  const handleSalvarNome = async () => {
    if (!displayName.trim()) {
      toast({ title: 'Nome não pode ser vazio', variant: 'destructive' })
      return
    }
    setSavingNome(true)
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ display_name: displayName.trim(), updated_at: new Date().toISOString() })
        .eq('user_id', user!.id)

      if (error) throw error

      await refetch()
      toast({ title: 'Nome atualizado com sucesso!' })
    } catch (err: any) {
      toast({ title: 'Erro ao atualizar nome', description: err.message, variant: 'destructive' })
    } finally {
      setSavingNome(false)
    }
  }

  const handleSalvarSenha = async () => {
    if (!novaSenha) {
      toast({ title: 'Digite a nova senha', variant: 'destructive' })
      return
    }
    if (novaSenha.length < 6) {
      toast({ title: 'A senha deve ter pelo menos 6 caracteres', variant: 'destructive' })
      return
    }
    if (novaSenha !== confirmarSenha) {
      toast({ title: 'As senhas não coincidem', variant: 'destructive' })
      return
    }
    setSavingSenha(true)
    try {
      const { error } = await updatePassword(novaSenha)
      if (error) throw error
      setNovaSenha('')
      setConfirmarSenha('')
    } finally {
      setSavingSenha(false)
    }
  }

  const roleLabel: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Administrador',
    gerente: 'Gerente',
    funcionario: 'Funcionário',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Meu Perfil
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">

          {/* Info somente leitura */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide">
              <Mail className="h-3.5 w-3.5" />
              E-mail (não editável)
            </Label>
            <Input value={user?.email || ''} disabled className="bg-muted text-muted-foreground" />
            {userProfile?.role && (
              <p className="text-xs text-muted-foreground">
                Perfil: <span className="font-medium">{roleLabel[userProfile.role] ?? userProfile.role}</span>
              </p>
            )}
          </div>

          <Separator />

          {/* Alterar nome */}
          <div className="space-y-3">
            <Label className="font-semibold">Nome de exibição</Label>
            <Input
              placeholder="Seu nome"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
            />
            <Button onClick={handleSalvarNome} disabled={savingNome} size="sm" className="w-full">
              {savingNome ? 'Salvando...' : 'Salvar Nome'}
            </Button>
          </div>

          <Separator />

          {/* Alterar senha */}
          <div className="space-y-3">
            <Label className="font-semibold flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Alterar Senha
            </Label>
            <Input
              type="password"
              placeholder="Nova senha (mín. 6 caracteres)"
              value={novaSenha}
              onChange={e => setNovaSenha(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Confirmar nova senha"
              value={confirmarSenha}
              onChange={e => setConfirmarSenha(e.target.value)}
            />
            {novaSenha && confirmarSenha && novaSenha !== confirmarSenha && (
              <p className="text-xs text-destructive">As senhas não coincidem</p>
            )}
            <Button onClick={handleSalvarSenha} disabled={savingSenha} size="sm" variant="outline" className="w-full">
              {savingSenha ? 'Alterando...' : 'Alterar Senha'}
            </Button>
          </div>

        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
