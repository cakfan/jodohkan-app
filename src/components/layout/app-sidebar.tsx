"use client";

import * as React from "react";
import Link from "next/link";
import { BookOpen, LayoutDashboard, MessageSquare, Search, Settings2 } from "lucide-react";

import { NavUser } from "./nav-user";
import { SidebarHeaderLogo } from "./sidebar-header";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const navMain = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    isActive: true,
  },
  {
    title: "CV Ta'aruf",
    url: "/cv",
    icon: BookOpen,
  },
  {
    title: "Cari Jodoh",
    url: "/discovery",
    icon: Search,
  },
  {
    title: "Pesan & Mediator",
    url: "/messages",
    icon: MessageSquare,
  },
];

const projects = [
  {
    title: "Pengaturan",
    url: "/settings",
    icon: Settings2,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" className="border-r" {...props}>
      <SidebarHeader>
        <SidebarHeaderLogo />
      </SidebarHeader>

      <SidebarContent className="py-2 px-3 group-data-[collapsible=icon]:px-0">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold tracking-[0.2em] uppercase group-data-[collapsible=icon]:hidden">
            Menu Utama
          </SidebarGroupLabel>
          <SidebarMenu className="mt-2 gap-1 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
            {navMain.map((item) => (
              <SidebarMenuItem key={item.title} className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                <SidebarMenuButton
                  render={
                    <Link href={item.url} className="flex items-center gap-2 group-data-[collapsible=icon]:w-auto">
                      <item.icon className="shrink-0" />
                      <span className="text-sm group-data-[collapsible=icon]:hidden">{item.title}</span>
                    </Link>
                  }
                  isActive={item.isActive}
                  tooltip={item.title}
                  className={cn(
                    "h-9 transition-all duration-200",
                    item.isActive
                      ? "bg-primary/10 text-primary font-semibold shadow-sm"
                      : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                  )}
                />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-[10px] font-bold tracking-[0.2em] uppercase group-data-[collapsible=icon]:hidden">
            Lainnya
          </SidebarGroupLabel>
          <SidebarMenu className="mt-2 gap-1 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
            {projects.map((item) => (
              <SidebarMenuItem key={item.title} className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                <SidebarMenuButton
                  render={
                    <Link href={item.url} className="flex items-center gap-2 group-data-[collapsible=icon]:w-auto">
                      <item.icon className="shrink-0" />
                      <span className="text-sm group-data-[collapsible=icon]:hidden">{item.title}</span>
                    </Link>
                  }
                  tooltip={item.title}
                  className="h-9 hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-all duration-200"
                />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-3 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
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
