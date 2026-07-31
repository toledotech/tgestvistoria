import { ReactNode } from 'react'
import { usePermissions, type Permissions } from '@/hooks/usePermissions'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield } from 'lucide-react'

interface PermissionGuardProps {
  children: ReactNode
  module: keyof Permissions
  action: keyof Permissions[keyof Permissions]
  fallback?: ReactNode
  showMessage?: boolean
}

export const PermissionGuard = ({ 
  children, 
  module, 
  action, 
  fallback = null,
  showMessage = true 
}: PermissionGuardProps) => {
  const { hasPermission, loading, userProfile } = usePermissions()

  if (loading) {
    return <div className="animate-pulse bg-muted h-8 rounded"></div>
  }

  if (!userProfile) {
    return null
  }

  if (!hasPermission(module, action)) {
    if (fallback) {
      return <>{fallback}</>
    }

    if (!showMessage) {
      return null
    }

    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Você não tem permissão para acessar este recurso.
        </AlertDescription>
      </Alert>
    )
  }

  return <>{children}</>
}