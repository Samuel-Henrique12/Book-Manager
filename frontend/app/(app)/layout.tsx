import Sidebar from "@/components/Sidebar";
import BarraTopoMovel from "@/components/BarraTopoMovel";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <BarraTopoMovel />
        <main className="mx-auto w-full max-w-[1180px] flex-1 px-5 pb-20 pt-7 sm:px-8 lg:px-10 lg:pt-10">
          {children}
        </main>
      </div>
    </div>
  );
}
