import { useNavigate } from "@tanstack/react-router"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Check } from "lucide-react"
import { useNotifications } from "@/hooks/useNotifications"

export default function Notifications() {
  const { notifications, unreadCount, markAllRead } = useNotifications()
  const navigate = useNavigate()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" /> Notificações
          {unreadCount > 0 && <Badge>{unreadCount} não lida(s)</Badge>}
        </CardTitle>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <Check className="h-4 w-4 mr-2" /> Marcar todas como lidas
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">Nenhuma notificação por enquanto.</div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              className={`flex items-start justify-between border rounded-lg p-3 ${n.link ? 'cursor-pointer hover:bg-muted/50' : ''} ${!n.read ? 'bg-accent/30' : ''}`}
              onClick={() => n.link && navigate({ to: n.link as string & {} })}
            >
              <div>
                <p className="font-medium text-sm">{n.title}</p>
                <p className="text-xs text-muted-foreground">{n.description}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {new Date(n.createdAt).toLocaleTimeString('pt-BR')}
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
