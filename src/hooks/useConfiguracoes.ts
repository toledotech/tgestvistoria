import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'

export interface ConfiguracoesEmpresa {
  id: string
  empresa_id: string
  nome_empresa: string | null
  cnpj: string | null
  endereco: string | null
  telefone: string | null
  email: string | null
  logo_url: string | null
  cor_tema: string | null
  configuracoes_notificacao: Record<string, any>
  configuracoes_sistema: Record<string, any>
  mercadopago_public_key: string | null
  mercadopago_access_token: string | null
  created_at: string
  updated_at: string
}

export function useConfiguracoes() {
  const [configuracoes, setConfiguracoes] = useState<ConfiguracoesEmpresa | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  const fetchConfiguracoes = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('configuracoes_empresa')
        .select('*')
        .maybeSingle()

      if (error) throw error

      if (data) {
        setConfiguracoes(data as any)
      } else {
        const { data: created, error: createError } = await supabase
          .from('configuracoes_empresa')
          .insert([{}])
          .select()
          .single()
        if (createError) throw createError
        setConfiguracoes(created as any)
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  const updateConfiguracoes = async (changes: Partial<ConfiguracoesEmpresa>) => {
    if (!configuracoes) return
    try {
      const { data, error } = await supabase
        .from('configuracoes_empresa')
        .update(changes as any)
        .eq('id', configuracoes.id)
        .select()
        .single()

      if (error) throw error
      setConfiguracoes(data as any)
      toast({ title: "Sucesso", description: "Configurações atualizadas" })
      return data
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error)
      toast({ title: "Erro", description: "Não foi possível atualizar as configurações", variant: "destructive" })
    }
  }

  const uploadLogo = async (file: File) => {
    if (!configuracoes) return
    try {
      const path = `${configuracoes.empresa_id}/logo-${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage.from('logos-empresa').upload(path, file, { upsert: true })
      if (uploadError) throw uploadError

      const { data: publicUrl } = supabase.storage.from('logos-empresa').getPublicUrl(path)
      await updateConfiguracoes({ logo_url: publicUrl.publicUrl })
    } catch (error) {
      console.error('Erro ao enviar logo:', error)
      toast({ title: "Erro", description: "Não foi possível enviar o logo", variant: "destructive" })
    }
  }

  useEffect(() => {
    fetchConfiguracoes()
  }, [fetchConfiguracoes])

  return { configuracoes, loading, updateConfiguracoes, uploadLogo, refetch: fetchConfiguracoes }
}
