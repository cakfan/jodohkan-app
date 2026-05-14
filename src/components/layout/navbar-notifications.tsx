import Link from "next/link";
import { Bell, BellDot } from "lucide-react";

export function NavbarNotifications({ unreadCount }: { unreadCount: number }) {
  return (
    <Link
      href="/notifications"
      className="relative flex size-8 items-center justify-center rounded-full transition-colors hover:bg-accent"
    >
      {unreadCount > 0 ? (
        <>
          <BellDot className="size-4.5 text-primary" />
          <span className="bg-primary text-primary-foreground absolute -right-0.5 -top-0.5 flex min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold leading-tight">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        </>
      ) : (
        <Bell className="size-4.5 text-muted-foreground" />
      )}
    </Link>
  );
}
