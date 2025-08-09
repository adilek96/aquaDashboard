"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
  Menu,
  X,
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
    name: "Статьи",
    href: "/dashboard/content",
    icon: FileText,
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
];

// Компонент для содержимого сайдбара (используется в десктопной и мобильной версии)
function SidebarContent({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col h-full">
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
              onClick={onItemClick}
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

export function Sidebar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Мобильная кнопка меню */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="bg-background/80 backdrop-blur-sm"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent onItemClick={() => setMobileMenuOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Десктопный сайдбар */}
      <div className="hidden lg:flex flex-col w-64 bg-card border-r border-border h-screen">
        <SidebarContent />
      </div>
    </>
  );
}
