"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Stethoscope, UserCheck } from "lucide-react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
      <SidebarHeader className="border-b border-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            {userRole === "doctor" ? (
              <Stethoscope className="h-4 w-4 text-primary-foreground" />
            ) : (
              <UserCheck className="h-4 w-4 text-primary-foreground" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">MedScribe</span>
            <span className="text-xs text-muted-foreground capitalize">
              {userRole} Portal
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navigation.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground">
              {section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const isActive = currentPath === item.href;
                  const hasSubItems = item.items && item.items.length > 0;
                  const hasActiveSubItem = item.items?.some(subItem => currentPath === subItem.href);
                  const shouldExpand = hasActiveSubItem || isActive;

                  if (hasSubItems) {
                    return (
                      <SidebarMenuItem key={item.href}>
                        <Collapsible defaultOpen={shouldExpand}>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                              className={cn(
                                "w-full justify-between",
                                (isActive || hasActiveSubItem) && "bg-accent text-accent-foreground"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <item.icon className="h-4 w-4" />
                                <span>{item.title}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                {item.badge && (
                                  <SidebarMenuBadge className="bg-primary text-primary-foreground">
                                    {item.badge}
                                  </SidebarMenuBadge>
                                )}
                                <ChevronRight className="h-3 w-3 transition-transform group-data-[state=open]:rotate-90" />
                              </div>
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item?.items?.map((subItem) => {
                                const isSubActive = currentPath === subItem.href;
                                return (
                                  <SidebarMenuSubItem key={subItem.href}>
                                    <SidebarMenuSubButton
                                      asChild
                                      className={cn(
                                        isSubActive && "bg-accent text-accent-foreground font-medium"
                                      )}
                                    >
                                      <Link href={subItem.href}>
                                        <subItem.icon className="h-3 w-3" />
                                        <span>{subItem.title}</span>
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                );
                              })}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </Collapsible>
                      </SidebarMenuItem>
                    );
                  }

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        className={cn(
                          isActive && "bg-accent text-accent-foreground font-medium"
                        )}
                      >
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                          {item.badge && (
                            <SidebarMenuBadge className="ml-auto bg-primary text-primary-foreground">
                              {item.badge}
                            </SidebarMenuBadge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-border">
        <div className="p-3">
          <div className="text-xs text-muted-foreground">
            MedScribe v2.0
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
