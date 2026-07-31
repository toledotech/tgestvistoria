import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export type TipoVistoria = 'seguradora' | 'detran' | 'tecnica_engenharia'
export type VistoriaStatus = 'agendada' | 'em_andamento' | 'concluida' | 'cancelada'
export type StatusPagamento = 'pendente' | 'pago' | 'cancelado'

export interface OrdemVistoria {
  id: string
  empresa_id: string
  numero_protocolo: string | null
  tipo_vistoria: TipoVistoria
  cliente_id: string
  veiculo_id: string
  vistoriador_id: string | null
  checklist_template_id: string | null
  status: VistoriaStatus
  data_agendada: string | null
  data_realizada: string | null
  valor: number
  status_pagamento: StatusPagamento
  observacoes: string | null
  created_at: string
  updated_at: string
  clientes?: { nome: string } | null
  veiculos?: { placa: string | null; marca: string | null; modelo: string | null } | null
}

export type CreateOrdemVistoriaData = {
  tipo_vistoria: TipoVistoria
  cliente_id: string
  veiculo_id: string
  vistoriador_id?: string | null
  checklist_template_id?: string | null
  status?: VistoriaStatus
  data_agendada?: string | null
  valor?: number
  observacoes?: string | null
}

export interface UpdateOrdemVistoriaData extends Partial<CreateOrdemVistoriaData> {
  id: string
  data_realizada?: string | null
  status_pagamento?: StatusPagamento
}

const SELECT_WITH_JOINS = '*, clientes(nome), veiculos(placa, marca, modelo)'

export function useVistorias() {
  const [ordens, setOrdens] = useState<OrdemVistoria[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  const fetchOrdens = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('ordens_vistoria')
        .select(SELECT_WITH_JOINS)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrdens((data as any) || [])
    } catch (error) {
      console.error('Erro ao carregar ordens de vistoria:', error)
      toast({ title: "Erro", description: "Não foi possível carregar as vistorias", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const createOrdem = async (ordemData: CreateOrdemVistoriaData) => {
    try {
      const { data, error } = await supabase
        .from('ordens_vistoria')
        .insert([ordemData])
        .select(SELECT_WITH_JOINS)
        .single()

      if (error) throw error

      setOrdens(prev => [data as any, ...prev])
      toast({ title: "Sucesso", description: "Ordem de vistoria criada com sucesso" })
      return data
    } catch (error) {
      console.error('Erro ao criar ordem de vistoria:', error)
      toast({ title: "Erro", description: "Não foi possível criar a ordem de vistoria", variant: "destructive" })
      throw error
    }
  }

  const updateOrdem = async ({ id, ...ordemData }: UpdateOrdemVistoriaData) => {
    try {
      const { data, error } = await supabase
        .from('ordens_vistoria')
        .update(ordemData)
        .eq('id', id)
        .select(SELECT_WITH_JOINS)
        .single()

      if (error) throw error

      setOrdens(prev => prev.map(o => (o.id === id ? (data as any) : o)))
      toast({ title: "Sucesso", description: "Ordem de vistoria atualizada com sucesso" })
      return data
    } catch (error) {
      console.error('Erro ao atualizar ordem de vistoria:', error)
      toast({ title: "Erro", description: "Não foi possível atualizar a ordem de vistoria", variant: "destructive" })
      throw error
    }
  }

  const deleteOrdem = async (ordemId: string) => {
    try {
      const { error } = await supabase.from('ordens_vistoria').delete().eq('id', ordemId)
      if (error) throw error

      setOrdens(prev => prev.filter(o => o.id !== ordemId))
      toast({ title: "Sucesso", description: "Ordem de vistoria excluída com sucesso" })
    } catch (error) {
      console.error('Erro ao excluir ordem de vistoria:', error)
      toast({ title: "Erro", description: "Não foi possível excluir a ordem de vistoria", variant: "destructive" })
    }
  }

  const getFilteredOrdens = () => {
    if (!searchTerm.trim()) return ordens
    const term = searchTerm.toLowerCase()
    return ordens.filter(o =>
      o.numero_protocolo?.toLowerCase().includes(term) ||
      o.clientes?.nome.toLowerCase().includes(term) ||
      o.veiculos?.placa?.toLowerCase().includes(term)
    )
  }

  useEffect(() => {
    fetchOrdens()
  }, [])

  return {
    ordens: getFilteredOrdens(),
    allOrdens: ordens,
    loading,
    searchTerm,
    setSearchTerm,
    createOrdem,
    updateOrdem,
    deleteOrdem,
    refetch: fetchOrdens
  }
}

export function useVistoria(id: string | undefined) {
  const [ordem, setOrdem] = useState<OrdemVistoria | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchOrdem = async () => {
    if (!id) return
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('ordens_vistoria')
        .select(SELECT_WITH_JOINS)
        .eq('id', id)
        .single()

      if (error) throw error
      setOrdem(data as any)
    } catch (error) {
      console.error('Erro ao carregar vistoria:', error)
      toast({ title: "Erro", description: "Não foi possível carregar a vistoria", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrdem()
  }, [id])

  return { ordem, loading, refetch: fetchOrdem }
}

export const tipoVistoriaLabel: Record<TipoVistoria, string> = {
  seguradora: 'Seguradora',
  detran: 'DETRAN',
  tecnica_engenharia: 'Técnica/Engenharia',
}

export const statusLabel: Record<VistoriaStatus, string> = {
  agendada: 'Agendada',
  em_andamento: 'Em andamento',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
}
