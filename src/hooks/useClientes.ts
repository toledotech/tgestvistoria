import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface Cliente {
  id: string
  empresa_id: string
  nome: string
  cpf_cnpj?: string | null
  email?: string | null
  telefone?: string | null
  endereco?: string | null
  cidade?: string | null
  estado?: string | null
  cep?: string | null
  observacoes?: string | null
  created_at: string
  updated_at: string
}

export type CreateClienteData = Omit<Cliente, 'id' | 'empresa_id' | 'created_at' | 'updated_at'>
export interface UpdateClienteData extends Partial<CreateClienteData> {
  id: string
}

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  const fetchClientes = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nome', { ascending: true })

      if (error) throw error
      setClientes(data || [])
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
      toast({ title: "Erro", description: "Não foi possível carregar os clientes", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const createCliente = async (clienteData: CreateClienteData) => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert([clienteData])
        .select()
        .single()

      if (error) throw error

      setClientes(prev => [...prev, data].sort((a, b) => a.nome.localeCompare(b.nome)))
      toast({ title: "Sucesso", description: "Cliente criado com sucesso" })
      return data
    } catch (error) {
      console.error('Erro ao criar cliente:', error)
      toast({ title: "Erro", description: "Não foi possível criar o cliente", variant: "destructive" })
      throw error
    }
  }

  const updateCliente = async ({ id, ...clienteData }: UpdateClienteData) => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .update(clienteData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setClientes(prev => prev.map(c => (c.id === id ? data : c)))
      toast({ title: "Sucesso", description: "Cliente atualizado com sucesso" })
      return data
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error)
      toast({ title: "Erro", description: "Não foi possível atualizar o cliente", variant: "destructive" })
      throw error
    }
  }

  const deleteCliente = async (clienteId: string) => {
    try {
      const { data: ordens, error: ordensError } = await supabase
        .from('ordens_vistoria')
        .select('id')
        .eq('cliente_id', clienteId)
        .limit(1)

      if (ordensError) throw ordensError

      if (ordens && ordens.length > 0) {
        toast({
          title: "Erro",
          description: "Não é possível excluir um cliente que possui ordens de vistoria associadas",
          variant: "destructive"
        })
        return
      }

      const { error } = await supabase.from('clientes').delete().eq('id', clienteId)
      if (error) throw error

      setClientes(prev => prev.filter(c => c.id !== clienteId))
      toast({ title: "Sucesso", description: "Cliente excluído com sucesso" })
    } catch (error) {
      console.error('Erro ao excluir cliente:', error)
      toast({ title: "Erro", description: "Não foi possível excluir o cliente", variant: "destructive" })
    }
  }

  const getFilteredClientes = () => {
    if (!searchTerm.trim()) return clientes
    const term = searchTerm.toLowerCase()
    return clientes.filter(c =>
      c.nome.toLowerCase().includes(term) ||
      c.cpf_cnpj?.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term) ||
      c.telefone?.toLowerCase().includes(term)
    )
  }

  useEffect(() => {
    fetchClientes()
  }, [])

  return {
    clientes: getFilteredClientes(),
    allClientes: clientes,
    loading,
    searchTerm,
    setSearchTerm,
    createCliente,
    updateCliente,
    deleteCliente,
    refetch: fetchClientes
  }
}
