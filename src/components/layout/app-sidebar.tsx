"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, BookOpen, LayoutDashboard, MessageSquare, Settings2, Shield, Users, HeartHandshake, Wallet } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
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
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";
import { getTaarufRequestCounts } from "@/app/actions/taaruf";

const candidateNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "CV Ta'aruf", url: "/cv/edit", icon: BookOpen },
  { title: "Temukan", url: "/temukan", icon: Users },
  { title: "Ta'aruf", url: "/taaruf", icon: HeartHandshake },
  { title: "Pesan", url: "/messages", icon: MessageSquare },
  { title: "Notifikasi", url: "/notifications", icon: Bell },
  { title: "Wallet", url: "/topup", icon: Wallet },
  { title: "Pengaturan", url: "/settings", icon: Settings2 },
];

const adminNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Panel Admin", url: "/admin/review", icon: Shield },
  { title: "Pesan", url: "/messages", icon: MessageSquare },
  { title: "Wallet", url: "/topup", icon: Wallet },
  { title: "Pengaturan", url: "/settings", icon: Settings2 },
];

const mediatorNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Pesan", url: "/messages", icon: MessageSquare },
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

  React.useEffect(() => {
    getTaarufRequestCounts().then((counts) => {
      if (counts) setPendingTaaruf(counts.pendingIncoming);
    });
  }, []);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="px-3 py-5 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center"
        >
          <BrandLogo size="sm" className="shrink-0" />
          <span className="text-base font-bold tracking-tight group-data-[collapsible=icon]:hidden">
            Jodohkan
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 py-1 group-data-[collapsible=icon]:px-0">
        <SidebarMenu className="gap-0.5 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center">
          {navItems.map((item) => {
            const isActive =
              pathname === item.url ||
              (pathname.startsWith(item.url + "/") && item.url !== "/dashboard");
            const showBadge = item.url === "/taaruf" && pendingTaaruf > 0;

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
                      "right-1.5 top-1/2! -translate-y-1/2!",
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
                      "group-data-[collapsible=icon]:translate-y-0",
                    )}
                  >
                    <span className="group-data-[collapsible=icon]:sr-only">
                      {pendingTaaruf}
                    </span>
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
