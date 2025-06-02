"use client";

import { signOut } from "next-auth/react";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/notifications/notification-bell";

interface DashboardHeaderProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleProfileClick = () => {
    if (user.role === "patient") {
      router.push("/patient/settings");
    } else if (user.role === "doctor") {
      router.push("/doctor/settings");
    }
  };

  const handleSettingsClick = () => {
    if (user.role === "patient") {
      router.push("/patient/settings");
    } else if (user.role === "doctor") {
      router.push("/doctor/settings");
    }
  };

  return (
    <div className="flex items-center gap-2 h-full">
      {/* Notifications */}
      <NotificationBell />

      {/* Theme Toggle */}
      <ThemeToggle />

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-2 h-10 px-2 py-1 hover:bg-accent rounded-lg transition-colors"
          >
            <Avatar className="h-8 w-8 border border-border">
              <AvatarImage src="" alt={user.name} />
              <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden lg:flex flex-col items-start min-w-0">
              <span className="text-sm font-medium leading-tight truncate max-w-[100px]">
                {user.name}
              </span>
              <span className="text-xs text-muted-foreground leading-tight truncate max-w-[100px]">
                {user.role}
              </span>
            </div>
            <ChevronDown className="h-3 w-3 text-muted-foreground ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 p-2">
          <DropdownMenuLabel className="font-normal p-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-border">
                <AvatarImage src="" alt={user.name} />
                <AvatarFallback className="text-sm font-medium bg-primary/10 text-primary">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-1 min-w-0 flex-1">
                <p className="text-sm font-semibold leading-none truncate">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {user.email}
                </p>
                <Badge variant="secondary" className="w-fit text-xs capitalize mt-1">
                  {user.role}
                </Badge>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="my-2" />
          <DropdownMenuItem
            className="cursor-pointer p-3 rounded-lg hover:bg-accent transition-colors"
            onClick={handleProfileClick}
          >
            <User className="mr-3 h-4 w-4" />
            <span className="font-medium">Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer p-3 rounded-lg hover:bg-accent transition-colors"
            onClick={handleSettingsClick}
          >
            <Settings className="mr-3 h-4 w-4" />
            <span className="font-medium">Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-2" />
          <DropdownMenuItem
            className="cursor-pointer p-3 rounded-lg text-destructive hover:bg-destructive/10 focus:text-destructive transition-colors"
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
          >
            <LogOut className="mr-3 h-4 w-4" />
            <span className="font-medium">Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
