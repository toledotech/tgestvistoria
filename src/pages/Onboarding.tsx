import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2 } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export function Onboarding() {
  const [nomeEmpresa, setNomeEmpresa] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleCriarEmpresa = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nomeEmpresa.trim()) return

    setLoading(true)
    try {
      const { error } = await supabase.rpc('register_empresa', { p_nome_empresa: nomeEmpresa.trim() })
      if (error) throw error
      toast({ title: 'Empresa criada!', description: 'Bem-vindo ao TGestVistoria.' })
      // usePermissions() não é compartilhado via context — cada componente tem seu
      // próprio estado. Um reload garante que ProtectedRoute e o resto do app
      // recarreguem o perfil atualizado (com empresa_id preenchido).
      window.location.href = '/'
      return
    } catch (err: any) {
      toast({ title: 'Erro ao criar empresa', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-success/5 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary-hover">
            <Building2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Vamos começar</CardTitle>
            <CardDescription>
              Falta só um passo: qual o nome da sua empresa de vistoria?
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCriarEmpresa} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="empresa-nome">Nome da empresa</Label>
              <Input
                id="empresa-nome"
                placeholder="Ex: Vistoria Rápida Ltda"
                value={nomeEmpresa}
                onChange={(e) => setNomeEmpresa(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Criando..." : "Criar empresa e continuar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Onboarding
