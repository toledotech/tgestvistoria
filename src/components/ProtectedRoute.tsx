import { ReactNode, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { usePermissions } from '@/hooks/usePermissions'
import { Onboarding } from '@/pages/Onboarding'

interface ProtectedRouteProps {
  children: ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth()
  const { userProfile, loading: profileLoading } = usePermissions()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true })
    }
  }, [user, loading, navigate])

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Usuário acabou de se cadastrar (role padrão 'admin') mas ainda não criou
  // a empresa — SuperMaster (super_admin sem empresa) não passa por aqui.
  if (userProfile && userProfile.role === 'admin' && !userProfile.empresa_id) {
    return <Onboarding />
  }

  return <>{children}</>
}