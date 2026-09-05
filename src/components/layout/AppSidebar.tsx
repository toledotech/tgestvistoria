import {
  Home,
  Users,
  Car,
  ClipboardCheck,
  Calendar,
  DollarSign,
  Settings,
  BarChart3,
  Bell,
  Building2
} from "lucide-react"
import { Link, useLocation } from "@tanstack/react-router"
import { usePermissions } from "@/hooks/usePermissions"

type MenuAccess = 'all' | 'admin' | 'super_admin'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const superMasterItems = [
  { title: "Painel Admin", url: "/admin", icon: Building2 },
]

const allMenuItems: { title: string; url: string; icon: any; access: MenuAccess }[] = [
  { title: "Dashboard",        url: "/",             icon: Home,           access: 'all'   },
  { title: "Vistorias",        url: "/vistorias",    icon: ClipboardCheck, access: 'all'   },
  { title: "Agenda",           url: "/agenda",       icon: Calendar,       access: 'all'   },
  { title: "Clientes",         url: "/clientes",     icon: Users,          access: 'all'   },
  { title: "Veículos",         url: "/veiculos",     icon: Car,            access: 'all'   },
  { title: "Financeiro",       url: "/financeiro",   icon: DollarSign,     access: 'admin' },
  { title: "Relatórios",       url: "/relatorios",   icon: BarChart3,      access: 'admin' },
  { title: "Notificações",     url: "/notifications",icon: Bell,           access: 'all'   },
  { title: "Configurações",    url: "/configuracoes",icon: Settings,       access: 'admin' },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  const { isAdmin, isSuperAdmin, isSuperMaster } = usePermissions()
  const location = useLocation()

  // SuperMaster (sem empresa) vê apenas o Painel Admin
  const isSM = isSuperMaster()
  const menuItems = isSM
    ? superMasterItems
    : allMenuItems.filter(item => {
        if (item.access === 'super_admin') return isSuperAdmin()
        if (item.access === 'admin') return isAdmin()
        return true
      })

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent className="bg-sidebar">
        <SidebarGroup className="px-3 pt-6 pb-4">
          <SidebarGroupLabel className={`${isCollapsed ? 'hidden' : 'block'} text-muted-foreground font-semibold uppercase tracking-widest text-xs mb-2`}>
            Menu Principal
          </SidebarGroupLabel>

          <SidebarGroupContent className="mt-2">
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const isActive = item.url === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.url)
                return (
                  <SidebarMenuItem key={item.title}>
                    <Link
                      to={item.url}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative w-full ${
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground border border-sidebar-ring'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
                      }`}
                    >
                      <div className="p-1.5 shrink-0">
                        <item.icon className="h-4 w-4" />
                      </div>
                      {!isCollapsed && (
                        <span className="font-medium text-sm">{item.title}</span>
                      )}
                      {isActive && !isCollapsed && (
                        <div className="absolute right-3 w-1 h-5 bg-primary rounded-full"></div>
                      )}
                    </Link>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
