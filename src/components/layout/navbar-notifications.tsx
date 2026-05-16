"use client";

import Link from "next/link";
import {
  Bell,
  Check,
  ChevronRight,
  Heart,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { markNotificationRead, markAllNotificationsRead } from "@/app/actions/notification";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { NotificationData } from "@/app/actions/notification";

function formatTimeAgo(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  return date.toLocaleDateString("id-ID");
}

// Sesuaikan mapping icon dengan tipe notifikasi yang ada di app kamu
function NotifIcon({ type }: { type?: string }) {
  const base = "size-4 text-primary";
  if (type === "taaruf_request") return <Heart className={base} />;
  if (type === "message") return <MessageCircle className={base} />;
  return <CheckCircle2 className={base} />;
}

export function NavbarNotifications({
  unreadCount,
  notifications: initialNotifications,
}: {
  unreadCount: number;
  notifications: NotificationData[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    router.refresh();
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    router.refresh();
  };

  const handleItemClick = async (n: NotificationData) => {
    if (!n.read) await markNotificationRead(n.id);
    setOpen(false);
    router.push("/notifikasi");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={<Button variant="ghost" size="icon" className="relative rounded-full" />}
      >
        <>
          <Bell className="size-4.5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1.5 -right-1.5 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full p-0 text-[10px] leading-none font-bold">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </>
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={8} className="w-80 gap-0 overflow-clip p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2.5">
          <span className="text-sm font-semibold tracking-tight">Notifikasi</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-xs font-medium"
            >
              Tandai semua dibaca
            </Button>
          )}
        </div>

        <Separator />

        {/* List */}
        <div className="max-h-80 overflow-y-auto">
          {initialNotifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <div className="bg-muted flex size-10 items-center justify-center rounded-full">
                <Bell className="text-muted-foreground size-4.5" />
              </div>
              <p className="text-muted-foreground text-xs">Belum ada notifikasi</p>
            </div>
          ) : (
            initialNotifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleItemClick(n)}
                className={cn(
                  "group relative flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
                  "hover:bg-accent/10",
                  !n.read && "bg-primary/5"
                )}
              >
                {/* ✅ Strip indikator unread di kiri, lebih jelas dari dot kecil */}
                {!n.read && (
                  <span className="bg-primary absolute top-3 bottom-3 left-0 w-[3px] rounded-r-full" />
                )}

                {/* ✅ Icon avatar per tipe notifikasi */}
                <div
                  className={cn(
                    "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full",
                    !n.read ? "bg-primary/15" : "bg-muted"
                  )}
                >
                  <NotifIcon type={n.type} />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "truncate text-[13px] leading-snug",
                      // ✅ Unread: bold + foreground penuh. Read: normal + muted
                      !n.read
                        ? "text-foreground font-semibold"
                        : "text-muted-foreground font-normal"
                    )}
                  >
                    {n.title}
                  </p>
                  <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs leading-relaxed">
                    {n.body}
                  </p>
                  <span className="text-muted-foreground/60 mt-1 block text-[10.5px]">
                    {formatTimeAgo(n.createdAt)}
                  </span>
                </div>

                {/* ✅ Mark read: muncul hanya saat hover, bukan selalu visible */}
                {!n.read && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkRead(n.id);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        handleMarkRead(n.id);
                      }
                    }}
                    title="Tandai sudah dibaca"
                    className="hover:bg-primary/10 hover:text-primary text-muted-foreground mt-0.5 flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Check className="size-3.5" />
                  </div>
                )}
              </button>
            ))
          )}
        </div>

        <Separator />

        {/* Footer */}
        <Link
          href="/notifikasi"
          onClick={() => setOpen(false)}
          className="text-muted-foreground hover:text-foreground hover:bg-accent/30 flex items-center justify-between px-4 py-2.5 text-xs font-medium transition-colors"
        >
          Lihat Semua
          <ChevronRight className="size-3.5" />
        </Link>
      </PopoverContent>
    </Popover>
  );
}
