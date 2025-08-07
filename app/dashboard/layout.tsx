import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex ">
      <Sidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
