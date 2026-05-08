"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, BookOpen, LayoutDashboard, MessageSquare, Search, Settings2 } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "CV Ta'aruf", url: "/dashboard/cv/edit", icon: BookOpen },
  { title: "Cari Jodoh", url: "/discovery", icon: Search },
  { title: "Pesan", url: "/messages", icon: MessageSquare },
  { title: "Notifikasi", url: "/notifications", icon: Bell },
  { title: "Pengaturan", url: "/settings", icon: Settings2 },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="px-3 py-5 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center"
        >
          <BrandLogo size="sm" className="shrink-0" />
          <span className="text-base font-bold tracking-tight group-data-[collapsible=icon]:hidden">
            Pethuk Jodoh
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 py-1 group-data-[collapsible=icon]:px-0">
        <SidebarMenu className="gap-0.5 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center">
          {navItems.map((item) => {
            const isActive =
              pathname === item.url ||
              (pathname.startsWith(item.url + "/") && item.url !== "/dashboard");

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
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-3 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
        <NavUser
          user={{
            name: "User",
            email: "user@example.com",
            avatar: "/avatars/user.jpg",
          }}
        />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
