import SidebarShell from "@/components/Sidebar/SidebarShell";

export default function ComponentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen overflow-hidden p-4 bg-black">
      <SidebarShell>{children}</SidebarShell>
    </div>
  );
}
