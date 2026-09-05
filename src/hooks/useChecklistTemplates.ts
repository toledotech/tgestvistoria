import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import type { TipoVistoria } from '@/hooks/useVistorias'

export type TipoResposta = 'ok_nao_na' | 'texto' | 'numero'

export interface ChecklistItem {
  id: string
  label: string
  tipo_resposta: TipoResposta
  aceita_foto: boolean
  ordem: number
}

export interface ChecklistTemplate {
  id: string
  empresa_id: string
  tipo_vistoria: TipoVistoria
  nome: string
  itens: ChecklistItem[]
  ativo: boolean
  created_at: string
  updated_at: string
}

export function useChecklistTemplates() {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('checklist_templates')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error
      setTemplates((data as any) || [])
    } catch (error) {
      console.error('Erro ao carregar modelos de checklist:', error)
      toast({ title: "Erro", description: "Não foi possível carregar os modelos de checklist", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const createTemplate = async (tipo_vistoria: TipoVistoria, nome: string) => {
    try {
      const { data, error } = await supabase
        .from('checklist_templates')
        .insert([{ tipo_vistoria, nome, itens: [] }] as any)
        .select()
        .single()

      if (error) throw error
      setTemplates(prev => [...prev, data as any])
      toast({ title: "Sucesso", description: "Modelo de checklist criado" })
      return data
    } catch (error) {
      console.error('Erro ao criar modelo:', error)
      toast({ title: "Erro", description: "Não foi possível criar o modelo", variant: "destructive" })
      throw error
    }
  }

  const updateTemplate = async (id: string, changes: Partial<Pick<ChecklistTemplate, 'nome' | 'itens' | 'ativo'>>) => {
    try {
      const { data, error } = await supabase
        .from('checklist_templates')
        .update(changes as any)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setTemplates(prev => prev.map(t => (t.id === id ? (data as any) : t)))
      toast({ title: "Sucesso", description: "Modelo atualizado" })
      return data
    } catch (error) {
      console.error('Erro ao atualizar modelo:', error)
      toast({ title: "Erro", description: "Não foi possível atualizar o modelo", variant: "destructive" })
      throw error
    }
  }

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase.from('checklist_templates').delete().eq('id', id)
      if (error) throw error
      setTemplates(prev => prev.filter(t => t.id !== id))
      toast({ title: "Sucesso", description: "Modelo excluído" })
    } catch (error) {
      console.error('Erro ao excluir modelo:', error)
      toast({ title: "Erro", description: "Não foi possível excluir o modelo", variant: "destructive" })
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  return { templates, loading, createTemplate, updateTemplate, deleteTemplate, refetch: fetchTemplates }
}
