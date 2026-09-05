import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'

export type UserRole = 'super_admin' | 'admin' | 'gerente' | 'funcionario'

export interface Permissions {
  vistorias: {
    read: boolean
    write: boolean
    delete: boolean
  }
  clientes: {
    read: boolean
    write: boolean
    delete: boolean
  }
  veiculos: {
    read: boolean
    write: boolean
    delete: boolean
  }
  financeiro: {
    read: boolean
    write: boolean
    delete: boolean
  }
  relatorios: {
    read: boolean
    write: boolean
    delete: boolean
  }
  configuracoes: {
    read: boolean
    write: boolean
    delete: boolean
  }
}

export interface UserProfile {
  id: string
  user_id: string
  display_name?: string | null
  role: UserRole
  permissions: Permissions
  empresa_id?: string | null
}

export const usePermissions = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  const defaultPermissions: Record<UserRole, Permissions> = {
    super_admin: {
      vistorias: { read: true, write: true, delete: true },
      clientes: { read: true, write: true, delete: true },
      veiculos: { read: true, write: true, delete: true },
      financeiro: { read: true, write: true, delete: true },
      relatorios: { read: true, write: true, delete: true },
      configuracoes: { read: true, write: true, delete: true }
    },
    admin: {
      vistorias: { read: true, write: true, delete: true },
      clientes: { read: true, write: true, delete: true },
      veiculos: { read: true, write: true, delete: true },
      financeiro: { read: true, write: true, delete: true },
      relatorios: { read: true, write: true, delete: true },
      configuracoes: { read: true, write: true, delete: true }
    },
    gerente: {
      vistorias: { read: true, write: true, delete: false },
      clientes: { read: true, write: true, delete: false },
      veiculos: { read: true, write: true, delete: false },
      financeiro: { read: true, write: false, delete: false },
      relatorios: { read: true, write: false, delete: false },
      configuracoes: { read: true, write: false, delete: false }
    },
    funcionario: {
      vistorias: { read: true, write: true, delete: false },
      clientes: { read: true, write: true, delete: false },
      veiculos: { read: true, write: true, delete: false },
      financeiro: { read: false, write: false, delete: false },
      relatorios: { read: false, write: false, delete: false },
      configuracoes: { read: false, write: false, delete: false }
    }
  }

  const fetchUserProfile = async () => {
    if (!user) {
      setUserProfile(null)
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil:', error)
        return
      }

      if (data) {
        // A tabela guarda "permissions" para eventuais overrides por usuário,
        // mas o trigger de signup só preenche role — a base sempre vem do
        // mapa de defaults por role, com o que estiver salvo por cima.
        const storedPermissions = (data.permissions || {}) as Partial<Permissions>
        setUserProfile({
          ...data,
          permissions: { ...defaultPermissions[data.role as UserRole], ...storedPermissions }
        })
      } else {
        // Criar perfil padrão se não existir (fallback client-side; o trigger
        // handle_new_user_profile no banco também cobre isso no signup)
        const newProfile = {
          user_id: user.id,
          display_name: user.user_metadata?.display_name || user.email,
          role: 'funcionario' as UserRole,
          permissions: defaultPermissions.funcionario
        }

        const { data: createdProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            ...newProfile,
            permissions: newProfile.permissions as any
          })
          .select()
          .single()

        if (createError) {
          console.error('Erro ao criar perfil:', createError)
          toast({
            title: "Erro",
            description: "Não foi possível criar o perfil do usuário.",
            variant: "destructive"
          })
        } else {
          setUserProfile({
            ...createdProfile,
            permissions: createdProfile.permissions as unknown as Permissions
          })
        }
      }
    } catch (error) {
      console.error('Erro inesperado:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (role: UserRole) => {
    if (!userProfile) return false

    try {
      const permissions = defaultPermissions[role]

      const { error } = await supabase
        .from('user_profiles')
        .update({ role, permissions: permissions as any })
        .eq('id', userProfile.id)

      if (error) {
        console.error('Erro ao atualizar role:', error)
        toast({
          title: "Erro",
          description: "Não foi possível atualizar a função do usuário.",
          variant: "destructive"
        })
        return false
      }

      setUserProfile({ ...userProfile, role, permissions })
      toast({
        title: "Sucesso",
        description: "Função atualizada com sucesso!"
      })
      return true
    } catch (error) {
      console.error('Erro inesperado:', error)
      return false
    }
  }

  const updatePermissions = async (newPermissions: Permissions) => {
    if (!userProfile) return false

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ permissions: newPermissions as any })
        .eq('id', userProfile.id)

      if (error) {
        console.error('Erro ao atualizar permissões:', error)
        toast({
          title: "Erro",
          description: "Não foi possível atualizar as permissões.",
          variant: "destructive"
        })
        return false
      }

      setUserProfile({ ...userProfile, permissions: newPermissions })
      toast({
        title: "Sucesso",
        description: "Permissões atualizadas com sucesso!"
      })
      return true
    } catch (error) {
      console.error('Erro inesperado:', error)
      return false
    }
  }

  const hasPermission = (module: keyof Permissions, action: keyof Permissions[keyof Permissions]): boolean => {
    if (!userProfile) return false
    return userProfile.permissions[module]?.[action] === true
  }

  const isSuperAdmin = () => userProfile?.role === 'super_admin'
  const isSuperMaster = () => userProfile?.role === 'super_admin' && !userProfile?.empresa_id
  const isAdmin = () => userProfile?.role === 'super_admin' || userProfile?.role === 'admin'
  const isGerente = () => isAdmin() || userProfile?.role === 'gerente'

  useEffect(() => {
    fetchUserProfile()
  }, [user])

  return {
    userProfile,
    loading,
    hasPermission,
    isSuperAdmin,
    isSuperMaster,
    isAdmin,
    isGerente,
    updateUserRole,
    updatePermissions,
    defaultPermissions,
    refetch: fetchUserProfile
  }
}
