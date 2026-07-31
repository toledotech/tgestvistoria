import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'

export type NotificationType = 'vistoria_agendada' | 'pagamento_confirmado' | 'checklist_pendente'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  description: string
  createdAt: string
  read: boolean
  link?: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const seenRef = useRef<Set<string>>(new Set())
  const { user } = useAuth()

  const pushNotification = useCallback((n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>, dedupeKey: string) => {
    if (seenRef.current.has(dedupeKey)) return
    seenRef.current.add(dedupeKey)
    setNotifications(prev => [
      { ...n, id: dedupeKey, createdAt: new Date().toISOString(), read: false },
      ...prev,
    ].slice(0, 50))
  }, [])

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const checkPrazos = useCallback(async () => {
    const hoje = new Date()
    const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).toISOString()
    const fimHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1).toISOString()

    const { data } = await supabase
      .from('ordens_vistoria')
      .select('id, numero_protocolo, data_agendada')
      .gte('data_agendada', inicioHoje)
      .lt('data_agendada', fimHoje)
      .in('status', ['agendada', 'em_andamento'])

    data?.forEach(ordem => {
      pushNotification({
        type: 'vistoria_agendada',
        title: 'Vistoria agendada para hoje',
        description: `Protocolo ${ordem.numero_protocolo}`,
        link: `/vistorias/${ordem.id}`,
      }, `agendada-${ordem.id}`)
    })
  }, [pushNotification])

  useEffect(() => {
    if (!user) return
    checkPrazos()
    const interval = setInterval(checkPrazos, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [user, checkPrazos])

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('notificacoes-realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'ordens_vistoria' }, (payload) => {
        const nova = payload.new as any
        const antiga = payload.old as any
        if (antiga.status_pagamento !== 'pago' && nova.status_pagamento === 'pago') {
          pushNotification({
            type: 'pagamento_confirmado',
            title: 'Pagamento confirmado',
            description: `Vistoria ${nova.numero_protocolo} foi paga`,
            link: `/vistorias/${nova.id}`,
          }, `pago-${nova.id}`)
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user, pushNotification])

  return {
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,
    markAllRead,
  }
}
