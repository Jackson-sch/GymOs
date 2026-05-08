"use client";

import React, { useEffect, useState } from "react";
import { Bell, Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { 
  getNotifications, 
  markNotificationAsRead 
} from "@/lib/actions/notification-actions";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    const res = await getNotifications();
    if (res.success) {
      const data = res.data || [];
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.read).length);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // In a real app, you might use Pusher or similar for real-time
    const interval = setInterval(fetchNotifications, 30000); // 30s poll
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (id: string) => {
    const res = await markNotificationAsRead(id);
    if (res.success) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "SUCCESS": return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case "WARNING": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "ERROR": return <XCircle className="w-4 h-4 text-rose-500" />;
      default: return <Info className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-white/5 transition-all">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 glass-card border-white/10 bg-black/90 backdrop-blur-2xl">
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-sm font-bold uppercase tracking-widest">Notificaciones</h3>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-[10px] bg-primary/20 text-primary border-none">
              {unreadCount} nuevas
            </Badge>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div 
                key={n.id} 
                onClick={() => !n.read && handleMarkRead(n.id)}
                className={cn(
                  "p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer flex gap-3",
                  !n.read && "bg-white/5"
                )}
              >
                <div className="shrink-0 mt-0.5">
                  {getTypeIcon(n.type)}
                </div>
                <div className="space-y-1 min-w-0">
                  <p className={cn("text-xs leading-none font-semibold", !n.read ? "text-foreground" : "text-muted-foreground")}>
                    {n.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">
                    {n.message}
                  </p>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-tight">
                    {formatDistanceToNow(new Date(n.createdAt), { locale: es, addSuffix: true })}
                  </p>
                </div>
                {!n.read && (
                  <div className="shrink-0 flex items-center">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center opacity-50">
              <Bell className="w-8 h-8 mb-2 text-muted-foreground" />
              <p className="text-xs uppercase tracking-widest font-medium">Sin notificaciones</p>
            </div>
          )}
        </div>
        <div className="p-2 border-t border-white/10">
          <Button variant="ghost" className="w-full text-[10px] uppercase tracking-widest font-bold h-8 hover:bg-white/5">
            Ver todas
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
