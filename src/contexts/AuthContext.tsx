import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface AuthContextData {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, displayName?: string) => Promise<{ data?: any; error: any }>
  signIn: (email: string, password: string) => Promise<{ data?: any; error: any }>
  signOut: () => Promise<{ error: any }>
  resetPassword: (email: string) => Promise<{ error: any }>
  updatePassword: (newPassword: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextData | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Registrar listener ANTES de verificar sessão existente
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    // Verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      setLoading(true)
      const redirectUrl = `${window.location.origin}/`

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { display_name: displayName || email },
        },
      })

      if (error) {
        toast({
          title: error.message.includes('User already registered')
            ? 'Usuário já cadastrado'
            : 'Erro no cadastro',
          description: error.message.includes('User already registered')
            ? 'Este e-mail já está registrado. Tente fazer login.'
            : error.message,
          variant: 'destructive',
        })
        return { error }
      }

      if (data.user && !data.session) {
        toast({
          title: 'Verifique seu e-mail',
          description: 'Enviamos um link de confirmação para seu e-mail.',
        })
      }

      return { data, error: null }
    } catch (error: any) {
      toast({
        title: 'Erro no cadastro',
        description: 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive',
      })
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        toast({
          title: error.message.includes('Invalid login credentials')
            ? 'Credenciais inválidas'
            : 'Erro no login',
          description: error.message.includes('Invalid login credentials')
            ? 'E-mail ou senha incorretos.'
            : error.message,
          variant: 'destructive',
        })
        return { error }
      }

      toast({ title: 'Login realizado com sucesso!', description: 'Bem-vindo ao sistema.' })
      return { data, error: null }
    } catch (error: any) {
      toast({
        title: 'Erro no login',
        description: 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive',
      })
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()

      if (error) {
        toast({ title: 'Erro ao sair', description: error.message, variant: 'destructive' })
        return { error }
      }

      toast({ title: 'Logout realizado', description: 'Você foi desconectado com sucesso.' })
      return { error: null }
    } catch (error: any) {
      toast({ title: 'Erro ao sair', description: 'Ocorreu um erro inesperado.', variant: 'destructive' })
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      setLoading(true)
      const redirectUrl = `${window.location.origin}/reset-password`

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      })

      if (error) {
        toast({ title: 'Erro ao enviar email', description: error.message, variant: 'destructive' })
        return { error }
      }

      toast({
        title: 'Email enviado!',
        description: 'Verifique sua caixa de entrada para redefinir sua senha.',
      })
      return { error: null }
    } catch (error: any) {
      toast({
        title: 'Erro ao enviar email',
        description: 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive',
      })
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const updatePassword = async (newPassword: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.updateUser({ password: newPassword })

      if (error) {
        toast({ title: 'Erro ao atualizar senha', description: error.message, variant: 'destructive' })
        return { error }
      }

      toast({ title: 'Senha atualizada!', description: 'Sua senha foi alterada com sucesso.' })
      return { error: null }
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar senha',
        description: 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive',
      })
      return { error }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signUp, signIn, signOut, resetPassword, updatePassword }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextData => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
