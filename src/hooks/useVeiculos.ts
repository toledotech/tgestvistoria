import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface Veiculo {
  id: string
  empresa_id: string
  cliente_id: string | null
  marca?: string | null
  modelo?: string | null
  ano?: number | null
  placa?: string | null
  chassi?: string | null
  renavam?: string | null
  cor?: string | null
  observacoes?: string | null
  created_at: string
  updated_at: string
}

export type CreateVeiculoData = Omit<Veiculo, 'id' | 'empresa_id' | 'created_at' | 'updated_at'>
export interface UpdateVeiculoData extends Partial<CreateVeiculoData> {
  id: string
}

export function useVeiculos() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  const fetchVeiculos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('veiculos')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setVeiculos(data || [])
    } catch (error) {
      console.error('Erro ao carregar veículos:', error)
      toast({ title: "Erro", description: "Não foi possível carregar os veículos", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const createVeiculo = async (veiculoData: CreateVeiculoData) => {
    try {
      const { data, error } = await supabase
        .from('veiculos')
        .insert([veiculoData] as any)
        .select()
        .single()

      if (error) throw error

      setVeiculos(prev => [data, ...prev])
      toast({ title: "Sucesso", description: "Veículo criado com sucesso" })
      return data
    } catch (error) {
      console.error('Erro ao criar veículo:', error)
      toast({ title: "Erro", description: "Não foi possível criar o veículo", variant: "destructive" })
      throw error
    }
  }

  const updateVeiculo = async ({ id, ...veiculoData }: UpdateVeiculoData) => {
    try {
      const { data, error } = await supabase
        .from('veiculos')
        .update(veiculoData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setVeiculos(prev => prev.map(v => (v.id === id ? data : v)))
      toast({ title: "Sucesso", description: "Veículo atualizado com sucesso" })
      return data
    } catch (error) {
      console.error('Erro ao atualizar veículo:', error)
      toast({ title: "Erro", description: "Não foi possível atualizar o veículo", variant: "destructive" })
      throw error
    }
  }

  const deleteVeiculo = async (veiculoId: string) => {
    try {
      const { data: ordens, error: ordensError } = await supabase
        .from('ordens_vistoria')
        .select('id')
        .eq('veiculo_id', veiculoId)
        .limit(1)

      if (ordensError) throw ordensError

      if (ordens && ordens.length > 0) {
        toast({
          title: "Erro",
          description: "Não é possível excluir um veículo que possui ordens de vistoria associadas",
          variant: "destructive"
        })
        return
      }

      const { error } = await supabase.from('veiculos').delete().eq('id', veiculoId)
      if (error) throw error

      setVeiculos(prev => prev.filter(v => v.id !== veiculoId))
      toast({ title: "Sucesso", description: "Veículo excluído com sucesso" })
    } catch (error) {
      console.error('Erro ao excluir veículo:', error)
      toast({ title: "Erro", description: "Não foi possível excluir o veículo", variant: "destructive" })
    }
  }

  const getFilteredVeiculos = () => {
    if (!searchTerm.trim()) return veiculos
    const term = searchTerm.toLowerCase()
    return veiculos.filter(v =>
      v.placa?.toLowerCase().includes(term) ||
      v.modelo?.toLowerCase().includes(term) ||
      v.marca?.toLowerCase().includes(term) ||
      v.chassi?.toLowerCase().includes(term)
    )
  }

  useEffect(() => {
    fetchVeiculos()
  }, [])

  return {
    veiculos: getFilteredVeiculos(),
    allVeiculos: veiculos,
    loading,
    searchTerm,
    setSearchTerm,
    createVeiculo,
    updateVeiculo,
    deleteVeiculo,
    refetch: fetchVeiculos
  }
}
