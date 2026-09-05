import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export type TipoTransacao = 'receita' | 'despesa'
export type StatusTransacao = 'pendente' | 'confirmada' | 'cancelada'

export interface TransacaoFinanceira {
  id: string
  empresa_id: string
  ordem_vistoria_id: string | null
  cliente_id: string | null
  tipo: TipoTransacao
  categoria: string | null
  descricao: string | null
  valor: number
  status: StatusTransacao
  data_vencimento: string | null
  data_pagamento: string | null
  created_at: string
  updated_at: string
}

export type CreateTransacaoData = {
  tipo: TipoTransacao
  categoria?: string
  descricao?: string
  valor: number
  status?: StatusTransacao
  data_vencimento?: string | null
  ordem_vistoria_id?: string | null
  cliente_id?: string | null
}

export function useFinanceiro() {
  const [transacoes, setTransacoes] = useState<TransacaoFinanceira[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchTransacoes = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('transacoes_financeiras')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTransacoes(data || [])
    } catch (error) {
      console.error('Erro ao carregar financeiro:', error)
      toast({ title: "Erro", description: "Não foi possível carregar o financeiro", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const createTransacao = async (transacaoData: CreateTransacaoData) => {
    try {
      const { data, error } = await supabase.from('transacoes_financeiras').insert([transacaoData] as any).select().single()
      if (error) throw error
      setTransacoes(prev => [data, ...prev])
      toast({ title: "Sucesso", description: "Transação registrada" })
      return data
    } catch (error) {
      console.error('Erro ao criar transação:', error)
      toast({ title: "Erro", description: "Não foi possível registrar a transação", variant: "destructive" })
      throw error
    }
  }

  const deleteTransacao = async (id: string) => {
    try {
      const { error } = await supabase.from('transacoes_financeiras').delete().eq('id', id)
      if (error) throw error
      setTransacoes(prev => prev.filter(t => t.id !== id))
      toast({ title: "Sucesso", description: "Transação removida" })
    } catch (error) {
      console.error('Erro ao remover transação:', error)
      toast({ title: "Erro", description: "Não foi possível remover a transação", variant: "destructive" })
    }
  }

  const stats = {
    receitas: transacoes.filter(t => t.tipo === 'receita' && t.status === 'confirmada').reduce((s, t) => s + Number(t.valor), 0),
    despesas: transacoes.filter(t => t.tipo === 'despesa' && t.status === 'confirmada').reduce((s, t) => s + Number(t.valor), 0),
    pendentes: transacoes.filter(t => t.status === 'pendente').reduce((s, t) => s + Number(t.valor), 0),
  }

  useEffect(() => {
    fetchTransacoes()
  }, [])

  return { transacoes, loading, stats, createTransacao, deleteTransacao, refetch: fetchTransacoes }
}
