"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Stethoscope, UserCheck, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { NavSection } from "@/lib/navigation";

interface DashboardSidebarProps {
  navigation: NavSection[];
  userRole: "doctor" | "patient";
  currentPath: string;
}

export function DashboardSidebar({ navigation, userRole, currentPath }: DashboardSidebarProps) {

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-sm">
            {userRole === "doctor" ? (
              <Stethoscope className="h-5 w-5 text-primary-foreground" />
            ) : (
              <UserCheck className="h-5 w-5 text-primary-foreground" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">MedScribe</span>
            <span className="text-xs text-muted-foreground capitalize font-medium">
              {userRole} Portal
            </span>
          </div>
        </div>
      </SidebarHeader>

      <Separator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {navigation.flatMap((section) =>
                section.items.map((item) => {
                  const isActive = currentPath === item.href;

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                        className="transition-all duration-200 h-11 rounded-lg hover:bg-sidebar-accent/50"
                      >
                        <Link href={item.href} className="flex items-center gap-3">
                          <item.icon className="h-5 w-5" />
                          <span className="font-medium text-sm">{item.title}</span>
                          {item.badge && (
                            <SidebarMenuBadge className="ml-auto bg-primary text-primary-foreground">
                              {item.badge}
                            </SidebarMenuBadge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <Separator />

      <SidebarFooter>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="w-full h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}