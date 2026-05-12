"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function SidebarHeaderLogo() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          render={
            <Link href="/dashboard" className="flex w-full items-center gap-3 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
              <BrandLogo size="sm" className="shrink-0" />
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-bold tracking-tight">Jodohkan</span>
                <span className="truncate text-[11px] text-muted-foreground">
                  Ta&apos;aruf Islami
                </span>
              </div>
              <ChevronDown className="ml-auto size-4 shrink-0 group-data-[collapsible=icon]:hidden" />
            </Link>
          }
        />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
