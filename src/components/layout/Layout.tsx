import { useState } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { Bell, User, LogOut, Settings } from "lucide-react"
import { MeuPerfilModal } from "./MeuPerfilModal"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/useAuth"
import { useNotifications } from "@/hooks/useNotifications"
import { usePermissions } from "@/hooks/usePermissions"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth()
  const { unreadCount } = useNotifications()
  const { userProfile } = usePermissions()
  const [perfilOpen, setPerfilOpen] = useState(false)

  const roleLabel: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Administrador',
    gerente: 'Gerente',
    funcionario: 'Funcionário',
  }

  const displayName = userProfile?.display_name || user?.email || ''
  const role = userProfile?.role ? roleLabel[userProfile.role] : ''

  const handleLogout = async () => {
    await signOut()
  }
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-blue-800 bg-gradient-to-r from-blue-900 to-blue-700 flex items-center justify-between px-6 shadow-md">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="h-8 w-8 text-white hover:bg-white/10 rounded-lg" />
              <div className="flex flex-col">
                <h1 className="text-lg font-semibold text-white tracking-wide">
                  Sistema de Gestão para Vistoria Veicular
                </h1>
                {displayName && (
                  <span className="text-xs text-white/75 font-light tracking-wide">
                    {displayName}{role && <span className="text-white/60"> ({role})</span>}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/10 rounded-lg">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-amber-400 text-blue-900 text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/10 rounded-lg">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Usuário</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setPerfilOpen(true)}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Meu Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 p-6 bg-slate-50">
            {children}
          </div>
        </main>
      </div>
      <MeuPerfilModal open={perfilOpen} onOpenChange={setPerfilOpen} />
    </SidebarProvider>
  )
}