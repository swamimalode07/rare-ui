import SidebarShell from "@/components/Sidebar/SidebarShell";

export default function ComponentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen overflow-hidden p-2 bg-background">
      <SidebarShell>{children}</SidebarShell>
    </div>
  );
}
