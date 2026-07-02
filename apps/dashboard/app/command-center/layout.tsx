import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";

export default function CommandCenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto bg-[var(--black)] p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
