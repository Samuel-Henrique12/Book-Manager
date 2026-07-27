import Link from "next/link";
import Logotipo from "@/components/Logotipo";
import PainelLivros from "@/components/login/PainelLivros";

// Moldura das Telas de Autenticação
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[46fr_54fr]">
      <div className="flex items-center justify-center px-6 py-14 sm:px-10 lg:px-14 xl:px-20">
        <div className="w-full max-w-[430px]" style={{ animation: "rise 0.5s ease-out both" }}>
          <Link href="/login" aria-label="Book Manager" className="mb-11 inline-block">
            <Logotipo tamanho="md" />
          </Link>
          {children}
        </div>
      </div>
      <PainelLivros className="hidden lg:block" />
    </div>
  );
}
