import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import type { UserRole } from '@/hooks/usePermissions'

export interface Empresa {
  id: string
  nome: string
  cnpj: string | null
  plano: string
  ativo: boolean
  created_at: string
  updated_at: string
}

export function useEmpresas() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchEmpresas = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.rpc('supermaster_list_empresas')
      if (error) throw error
      setEmpresas(data || [])
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
      toast({ title: "Erro", description: "Não foi possível carregar as empresas", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const createEmpresa = async (nome: string, adminEmail?: string, adminPassword?: string, adminNome?: string) => {
    try {
      const { error } = await supabase.rpc('supermaster_create_empresa', {
        p_nome: nome,
        p_admin_email: adminEmail || undefined,
        p_admin_password: adminPassword || undefined,
        p_admin_nome: adminNome || undefined,
      })
      if (error) throw error
      toast({ title: "Sucesso", description: "Empresa criada" })
      await fetchEmpresas()
    } catch (error) {
      console.error('Erro ao criar empresa:', error)
      toast({ title: "Erro", description: "Não foi possível criar a empresa", variant: "destructive" })
      throw error
    }
  }

  const updateEmpresa = async (id: string, changes: { nome?: string; plano?: string; ativo?: boolean }) => {
    try {
      const { error } = await supabase.rpc('supermaster_update_empresa', {
        p_empresa_id: id,
        p_nome: changes.nome ?? undefined,
        p_plano: changes.plano ?? undefined,
        p_ativo: changes.ativo ?? undefined,
      })
      if (error) throw error
      toast({ title: "Sucesso", description: "Empresa atualizada" })
      await fetchEmpresas()
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error)
      toast({ title: "Erro", description: "Não foi possível atualizar a empresa", variant: "destructive" })
    }
  }

  const deleteEmpresa = async (id: string) => {
    try {
      const { error } = await supabase.rpc('supermaster_delete_empresa', { p_empresa_id: id })
      if (error) throw error
      toast({ title: "Sucesso", description: "Empresa excluída" })
      await fetchEmpresas()
    } catch (error) {
      console.error('Erro ao excluir empresa:', error)
      toast({ title: "Erro", description: "Não foi possível excluir a empresa", variant: "destructive" })
      throw error
    }
  }

  const createUserForEmpresa = async (
    empresaId: string,
    nome: string,
    email: string,
    password: string,
    role: UserRole = 'admin'
  ) => {
    try {
      const { error } = await supabase.rpc('supermaster_create_user', {
        p_empresa_id: empresaId,
        p_email: email,
        p_password: password,
        p_nome: nome,
        p_role: role,
      })
      if (error) throw error
      toast({ title: "Sucesso", description: "Usuário criado" })
    } catch (error) {
      console.error('Erro ao criar usuário:', error)
      toast({ title: "Erro", description: "Não foi possível criar o usuário", variant: "destructive" })
      throw error
    }
  }

  useEffect(() => {
    fetchEmpresas()
  }, [])

  return { empresas, loading, createEmpresa, updateEmpresa, deleteEmpresa, createUserForEmpresa, refetch: fetchEmpresas }
}
