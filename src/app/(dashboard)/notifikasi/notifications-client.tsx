"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  HeartHandshake,
  Shield,
  XCircle,
  Clock,
  FileText,
  Rocket,
  Video,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { markNotificationRead, markAllNotificationsRead } from "@/app/actions/notification";
import { toast } from "sonner";
import type { NotificationData } from "@/app/actions/notification";

const iconMap: Record<string, React.ElementType> = {
  taaruf_request_received: HeartHandshake,
  taaruf_request_accepted: HeartHandshake,
  taaruf_request_declined: XCircle,
  taaruf_request_expired: Clock,
  taaruf_ended: Shield,
  cv_approved: FileText,
  cv_rejected: FileText,
  nadzor_activated: Rocket,
  nadzor_scheduled: Video,
  nadzor_reminder: Video,
  nadzor_feedback: MessageSquare,
};

function getNotificationHref(notif: NotificationData): string | null {
  switch (notif.type) {
    case "taaruf_request_received":
      return "/taaruf";
    case "taaruf_request_accepted":
      return "/pesan";
    case "taaruf_request_declined":
    case "taaruf_request_expired":
      return "/taaruf";
    case "taaruf_ended":
      return "/pesan";
    case "cv_approved":
    case "cv_rejected":
      return "/cv/edit";
    case "nadzor_activated":
    case "nadzor_scheduled":
    case "nadzor_reminder":
    case "nadzor_feedback":
      return "/pesan";
    default:
      return null;
  }
}

export function NotificationsClient({
  initialData,
  initialUnread,
}: {
  initialData: NotificationData[];
  initialUnread: number;
}) {
  const [notifications, setNotifications] = useState(initialData);
  const [unread, setUnread] = useState(initialUnread);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleMarkRead = async (id: string) => {
    setLoadingId(id);
    const result = await markNotificationRead(id);
    setLoadingId(null);
    if (result.success) {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnread((prev) => Math.max(0, prev - 1));
    }
  };

  const handleMarkAllRead = async () => {
    const result = await markAllNotificationsRead();
    if (result.success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnread(0);
      toast.success("Semua notifikasi telah dibaca");
    }
  };

  return (
    <div className="mx-auto w-full px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck className="mr-1.5 size-4" />
            Tandai semua telah dibaca
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Bell className="text-muted-foreground/20 mb-3 size-12" />
            <p className="text-muted-foreground text-sm">Belum ada notifikasi</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((notif) => {
            const Icon = iconMap[notif.type] ?? Bell;
            const href = getNotificationHref(notif);

            const content = (
              <div
                className={cn(
                  "hover:bg-accent/10 flex items-start gap-3 rounded-xl border p-4 transition-colors",
                  !notif.read && "border-l-primary bg-primary/10 border-l-2"
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full",
                    notif.read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                  )}
                >
                  <Icon className="size-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className={cn("text-sm", !notif.read && "font-semibold")}>{notif.title}</p>
                      <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                        {notif.body}
                      </p>
                    </div>
                    <time className="text-muted-foreground mt-0.5 shrink-0 text-[10px]">
                      {formatTime(notif.createdAt)}
                    </time>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    {!notif.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkRead(notif.id)}
                        disabled={loadingId === notif.id}
                        className="text-muted-foreground h-auto px-2 py-0.5 text-[10px]"
                      >
                        {loadingId === notif.id ? "..." : "Tandai telah dibaca"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );

            if (href) {
              return (
                <Link key={notif.id} href={href} className="block">
                  {content}
                </Link>
              );
            }

            return <div key={notif.id}>{content}</div>;
          })}
        </div>
      )}
    </div>
  );
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}j`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}h`;
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}
