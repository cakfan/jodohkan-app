"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BookOpen,
  LayoutDashboard,
  MessageSquare,
  Settings2,
  Shield,
  Users,
  HeartHandshake,
  Wallet,
} from "lucide-react";

import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";
import { getTaarufRequestCounts } from "@/app/actions/taaruf";
import { getUnreadMessageCount } from "@/app/actions/stream";
import { getUnreadNotificationCount } from "@/app/actions/notification";

const candidateNavItems = [
  { title: "Dashboard", url: "/beranda", icon: LayoutDashboard },
  { title: "CV Ta'aruf", url: "/cv/edit", icon: BookOpen },
  { title: "Temukan", url: "/temukan", icon: Users },
  { title: "Ta'aruf", url: "/taaruf", icon: HeartHandshake },
  { title: "Pesan", url: "/pesan", icon: MessageSquare },
  { title: "Notifikasi", url: "/notifikasi", icon: Bell },
  { title: "Wallet", url: "/topup", icon: Wallet },
  { title: "Pengaturan", url: "/settings", icon: Settings2 },
];

const adminNavItems = [
  { title: "Dashboard", url: "/beranda", icon: LayoutDashboard },
  { title: "Panel Admin", url: "/admin/review", icon: Shield },
  { title: "Pesan", url: "/pesan", icon: MessageSquare },
  { title: "Wallet", url: "/topup", icon: Wallet },
  { title: "Pengaturan", url: "/settings", icon: Settings2 },
];

const mediatorNavItems = [
  { title: "Dashboard", url: "/beranda", icon: LayoutDashboard },
  { title: "Pesan", url: "/pesan", icon: MessageSquare },
  { title: "Wallet", url: "/topup", icon: Wallet },
  { title: "Pengaturan", url: "/settings", icon: Settings2 },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const isMediator = session?.user?.role === "mediator";
  const navItems = isAdmin ? adminNavItems : isMediator ? mediatorNavItems : candidateNavItems;
  const [pendingTaaruf, setPendingTaaruf] = React.useState(0);
  const [unreadMessages, setUnreadMessages] = React.useState(0);
  const [unreadNotif, setUnreadNotif] = React.useState(0);

  React.useEffect(() => {
    getTaarufRequestCounts().then((counts) => {
      if (counts) setPendingTaaruf(counts.pendingIncoming);
    });
  }, []);

  React.useEffect(() => {
    const fetch = () => getUnreadMessageCount().then(setUnreadMessages);
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    const fetch = () => getUnreadNotificationCount().then(setUnreadNotif);
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Header: title kiri, toggle kanan — collapsed: hanya toggle */}
      <SidebarHeader className="flex h-[60px] flex-row items-center justify-between px-5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
        <Link href="/beranda" className="group-data-[collapsible=icon]:hidden">
          <span className="font-heading text-foreground text-xl font-semibold tracking-tight">
            Jodohkan
          </span>
        </Link>
        <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
      </SidebarHeader>

      <SidebarContent className="px-3 py-1 group-data-[collapsible=icon]:px-0">
        <SidebarMenu className="gap-0.5 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center">
          {navItems.map((item) => {
            const isActive =
              pathname === item.url ||
              (pathname.startsWith(item.url + "/") && item.url !== "/beranda");
            const showBadge =
              (item.url === "/taaruf" && pendingTaaruf > 0) ||
              (item.url === "/pesan" && unreadMessages > 0) ||
              (item.url === "/notifikasi" && unreadNotif > 0);
            const badgeCount =
              item.url === "/taaruf"
                ? pendingTaaruf
                : item.url === "/pesan"
                  ? unreadMessages
                  : item.url === "/notifikasi"
                    ? unreadNotif
                    : 0;

            return (
              <SidebarMenuItem
                key={item.title}
                className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center"
              >
                <SidebarMenuButton
                  render={
                    <Link
                      href={item.url}
                      className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center"
                    >
                      <item.icon className="size-5 shrink-0" />
                      <span className="text-sm group-data-[collapsible=icon]:hidden">
                        {item.title}
                      </span>
                    </Link>
                  }
                  isActive={isActive}
                  tooltip={item.title}
                  className={cn(
                    "h-11 rounded-xl text-sm font-medium transition-all duration-200",
                    "group-data-[collapsible=icon]:p-0!",
                    isActive
                      ? "bg-accent text-accent-foreground font-semibold"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                />
                {showBadge && (
                  <SidebarMenuBadge
                    className={cn(
                      "top-1/2! right-1.5 -translate-y-1/2!",
                      "group-data-[collapsible=icon]:flex!",
                      "group-data-[collapsible=icon]:right-0!",
                      "group-data-[collapsible=icon]:top-1!",
                      "group-data-[collapsible=icon]:size-2.5",
                      "group-data-[collapsible=icon]:min-w-2.5",
                      "group-data-[collapsible=icon]:rounded-full!",
                      "group-data-[collapsible=icon]:p-0",
                      "group-data-[collapsible=icon]:border-2",
                      "group-data-[collapsible=icon]:border-background",
                      "group-data-[collapsible=icon]:bg-destructive",
                      "group-data-[collapsible=icon]:overflow-hidden",
                      "group-data-[collapsible=icon]:translate-y-0"
                    )}
                  >
                    <span className="group-data-[collapsible=icon]:sr-only">{badgeCount}</span>
                  </SidebarMenuBadge>
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-3 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
