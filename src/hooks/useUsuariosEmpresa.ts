import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import type { UserRole } from '@/hooks/usePermissions'

export interface UsuarioEmpresa {
  id: string
  user_id: string
  display_name: string | null
  role: UserRole
}

export function useUsuariosEmpresa() {
  const [usuarios, setUsuarios] = useState<UsuarioEmpresa[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchUsuarios = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, user_id, display_name, role')
        .order('created_at', { ascending: true })

      if (error) throw error
      setUsuarios(data || [])
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      toast({ title: "Erro", description: "Não foi possível carregar os usuários", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const criarUsuario = async (email: string, password: string, nome: string, role: UserRole) => {
    try {
      const { error } = await supabase.rpc('admin_create_user', {
        p_email: email, p_password: password, p_nome: nome, p_role: role,
      })
      if (error) throw error
      toast({ title: "Sucesso", description: "Usuário criado" })
      await fetchUsuarios()
    } catch (error) {
      console.error('Erro ao criar usuário:', error)
      toast({ title: "Erro", description: "Não foi possível criar o usuário", variant: "destructive" })
      throw error
    }
  }

  const atualizarRole = async (userProfileId: string, role: UserRole) => {
    try {
      const { error } = await supabase.rpc('admin_update_user_role', {
        p_user_profile_id: userProfileId, p_role: role,
      })
      if (error) throw error
      setUsuarios(prev => prev.map(u => (u.id === userProfileId ? { ...u, role } : u)))
      toast({ title: "Sucesso", description: "Função atualizada" })
    } catch (error) {
      console.error('Erro ao atualizar função:', error)
      toast({ title: "Erro", description: "Não foi possível atualizar a função", variant: "destructive" })
    }
  }

  useEffect(() => {
    fetchUsuarios()
  }, [])

  return { usuarios, loading, criarUsuario, atualizarRole, refetch: fetchUsuarios }
}
