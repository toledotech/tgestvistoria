import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface Pagamento {
  id: string
  empresa_id: string
  ordem_vistoria_id: string
  gateway: string
  gateway_payment_id: string | null
  metodo: 'pix' | 'cartao' | null
  status: string
  qr_code: string | null
  qr_code_base64: string | null
  link_pagamento: string | null
  valor: number
  created_at: string
  updated_at: string
}

export function usePagamento(ordemVistoriaId: string | undefined) {
  const [pagamento, setPagamento] = useState<Pagamento | null>(null)
  const [loading, setLoading] = useState(true)
  const [gerando, setGerando] = useState(false)
  const { toast } = useToast()

  const fetchPagamento = useCallback(async () => {
    if (!ordemVistoriaId) return
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('pagamentos')
        .select('*')
        .eq('ordem_vistoria_id', ordemVistoriaId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error
      setPagamento(data as any)
    } catch (error) {
      console.error('Erro ao carregar pagamento:', error)
    } finally {
      setLoading(false)
    }
  }, [ordemVistoriaId])

  const gerarCobranca = async () => {
    if (!ordemVistoriaId) return
    setGerando(true)
    try {
      const { data, error } = await supabase.functions.invoke('mercadopago-checkout', {
        body: { ordemVistoriaId },
      })
      if (error) throw error
      setPagamento(data.pagamento)
      return data
    } catch (error: any) {
      console.error('Erro ao gerar cobrança:', error)
      toast({ title: "Erro", description: "Não foi possível gerar a cobrança", variant: "destructive" })
    } finally {
      setGerando(false)
    }
  }

  useEffect(() => {
    fetchPagamento()
  }, [fetchPagamento])

  // Realtime: assim que o webhook do Mercado Pago atualizar o status, a UI
  // reflete sozinha, sem precisar de F5.
  useEffect(() => {
    if (!ordemVistoriaId) return
    const channel = supabase
      .channel(`pagamentos-${ordemVistoriaId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'pagamentos', filter: `ordem_vistoria_id=eq.${ordemVistoriaId}` },
        (payload) => setPagamento(payload.new as Pagamento)
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [ordemVistoriaId])

  return { pagamento, loading, gerando, gerarCobranca, refetch: fetchPagamento }
}
