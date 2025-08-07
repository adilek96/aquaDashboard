"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Home,
  FileText,
  Users,
  Fish,
  Key,
  Zap,
  FolderOpen,
  FolderTree,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";

const navigation = [
  {
    name: "Обзор",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Категории",
    href: "/dashboard/categories",
    icon: FolderOpen,
  },
  {
    name: "Подкатегории",
    href: "/dashboard/subcategories",
    icon: FolderTree,
  },
  {
    name: "Контент",
    href: "/dashboard/content",
    icon: FileText,
    badge: "Новое",
  },
  {
    name: "Обитатели",
    href: "/dashboard/inhabitants",
    icon: Fish,
  },
  {
    name: "Пользователи",
    href: "/dashboard/users",
    icon: Users,
  },
  {
    name: "Токены",
    href: "/dashboard/tokens",
    icon: Key,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col w-64 bg-card border-r border-border h-screen">
      {/* Header */}
      <div className="flex items-center h-16 px-6 border-b border-border">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="AquaDaddy" width={32} height={32} />
          <div>
            <div className="font-semibold text-foreground">AquaDaddy</div>
            <div className="text-xs text-muted-foreground">
              Панель управления
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4" />
                {item.name}
              </div>
              {item.badge && (
                <Badge
                  variant="secondary"
                  className="text-xs px-1.5 py-0.5 h-5"
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-accent rounded-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-xs font-semibold text-white">
                {user ? user.charAt(0).toUpperCase() : "А"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">
                {user || "Администратор"}
              </div>
              <div className="text-xs text-muted-foreground">
                admin@aquadaddy.app
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="w-full flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Выйти
          </Button>
        </div>
      </div>
    </div>
  );
}
