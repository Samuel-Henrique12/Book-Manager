import Sidebar from "@/components/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="mx-auto w-full max-w-[980px] flex-1 px-6 pb-16 pt-9 md:px-11">
          {children}
        </main>
      </div>
    </div>
  );
}
