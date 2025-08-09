import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 overflow-hidden lg:ml-0">
        <main className="h-full overflow-y-auto">
          <div className="lg:hidden h-16"></div>{" "}
          {/* Отступ для мобильной кнопки меню */}
          {children}
        </main>
      </div>
    </div>
  );
}
