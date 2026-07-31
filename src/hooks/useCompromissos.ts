import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface Compromisso {
  id: string
  empresa_id: string
  titulo: string
  descricao: string | null
  data_hora: string
  created_at: string
  updated_at: string
}

export type CreateCompromissoData = { titulo: string; descricao?: string; data_hora: string }

export function useCompromissos() {
  const [compromissos, setCompromissos] = useState<Compromisso[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchCompromissos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('compromissos')
        .select('*')
        .order('data_hora', { ascending: true })

      if (error) throw error
      setCompromissos(data || [])
    } catch (error) {
      console.error('Erro ao carregar compromissos:', error)
      toast({ title: "Erro", description: "Não foi possível carregar a agenda", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const createCompromisso = async (compromissoData: CreateCompromissoData) => {
    try {
      const { data, error } = await supabase.from('compromissos').insert([compromissoData]).select().single()
      if (error) throw error
      setCompromissos(prev => [...prev, data].sort((a, b) => a.data_hora.localeCompare(b.data_hora)))
      toast({ title: "Sucesso", description: "Compromisso criado" })
      return data
    } catch (error) {
      console.error('Erro ao criar compromisso:', error)
      toast({ title: "Erro", description: "Não foi possível criar o compromisso", variant: "destructive" })
      throw error
    }
  }

  const deleteCompromisso = async (id: string) => {
    try {
      const { error } = await supabase.from('compromissos').delete().eq('id', id)
      if (error) throw error
      setCompromissos(prev => prev.filter(c => c.id !== id))
      toast({ title: "Sucesso", description: "Compromisso removido" })
    } catch (error) {
      console.error('Erro ao remover compromisso:', error)
      toast({ title: "Erro", description: "Não foi possível remover o compromisso", variant: "destructive" })
    }
  }

  useEffect(() => {
    fetchCompromissos()
  }, [])

  return { compromissos, loading, createCompromisso, deleteCompromisso, refetch: fetchCompromissos }
}
