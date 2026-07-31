import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface RespostaItem {
  valor: string | boolean | number | null
  fotos: string[]
}

export interface ChecklistResposta {
  id: string
  empresa_id: string
  ordem_vistoria_id: string
  template_id: string | null
  respostas: Record<string, RespostaItem>
  fotos: string[]
  assinatura_vistoriador: string | null
  laudo_pdf_path: string | null
  concluido_em: string | null
  created_at: string
  updated_at: string
}

export function useChecklistResposta(ordemVistoriaId: string | undefined, templateId: string | null | undefined) {
  const [resposta, setResposta] = useState<ChecklistResposta | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchResposta = useCallback(async () => {
    if (!ordemVistoriaId) return
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('checklist_respostas')
        .select('*')
        .eq('ordem_vistoria_id', ordemVistoriaId)
        .maybeSingle()

      if (error) throw error

      if (data) {
        setResposta(data as any)
      } else if (templateId) {
        const { data: created, error: createError } = await supabase
          .from('checklist_respostas')
          .insert([{ ordem_vistoria_id: ordemVistoriaId, template_id: templateId, respostas: {} }])
          .select()
          .single()
        if (createError) throw createError
        setResposta(created as any)
      }
    } catch (error) {
      console.error('Erro ao carregar checklist:', error)
      toast({ title: "Erro", description: "Não foi possível carregar o checklist", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [ordemVistoriaId, templateId])

  const salvarRespostas = async (respostas: Record<string, RespostaItem>) => {
    if (!resposta) return
    try {
      const { data, error } = await supabase
        .from('checklist_respostas')
        .update({ respostas })
        .eq('id', resposta.id)
        .select()
        .single()

      if (error) throw error
      setResposta(data as any)
      toast({ title: "Checklist salvo" })
    } catch (error) {
      console.error('Erro ao salvar checklist:', error)
      toast({ title: "Erro", description: "Não foi possível salvar o checklist", variant: "destructive" })
    }
  }

  const uploadFoto = async (file: File): Promise<string> => {
    const path = `${resposta?.ordem_vistoria_id}/${crypto.randomUUID()}-${file.name}`
    const { error } = await supabase.storage.from('fotos-vistoria').upload(path, file)
    if (error) throw error
    return path
  }

  const concluirChecklist = async () => {
    if (!resposta) return
    try {
      const { data, error } = await supabase
        .from('checklist_respostas')
        .update({ concluido_em: new Date().toISOString() })
        .eq('id', resposta.id)
        .select()
        .single()

      if (error) throw error
      setResposta(data as any)
      toast({ title: "Checklist concluído" })
      return data
    } catch (error) {
      console.error('Erro ao concluir checklist:', error)
      toast({ title: "Erro", description: "Não foi possível concluir o checklist", variant: "destructive" })
    }
  }

  const salvarLaudoPdf = async (path: string) => {
    if (!resposta) return
    const { data, error } = await supabase
      .from('checklist_respostas')
      .update({ laudo_pdf_path: path })
      .eq('id', resposta.id)
      .select()
      .single()

    if (!error) setResposta(data as any)
  }

  useEffect(() => {
    fetchResposta()
  }, [fetchResposta])

  return { resposta, loading, salvarRespostas, uploadFoto, concluirChecklist, salvarLaudoPdf, refetch: fetchResposta }
}
