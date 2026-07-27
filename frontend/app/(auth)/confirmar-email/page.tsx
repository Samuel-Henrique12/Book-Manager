"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CircleCheckBig, Loader2, TriangleAlert } from "lucide-react";
import { confirmarEmail } from "@/lib/contas";
import { ApiError } from "@/lib/api";
import { CLASSE_BOTAO } from "@/components/login/Cabecalho";

export default function PaginaConfirmarEmail() {
  return (
    <Suspense fallback={<Carregando />}>
      <Confirmacao />
    </Suspense>
  );
}

function Confirmacao() {
  const token = useSearchParams().get("token");

  // Link Sem Token
  if (!token) {
    return (
      <Resultado
        ok={false}
        mensagem="O link está incompleto. Abra o e-mail e clique no botão novamente."
      />
    );
  }

  return <Verificacao token={token} />;
}

function Verificacao({ token }: { token: string }) {
  const [resultado, setResultado] = useState<{ ok: boolean; mensagem: string } | null>(null);
  const jaEnviou = useRef(false);

  useEffect(() => {
    // O StrictMode Monta Duas Vezes em Dev e o Token é de Uso Único
    if (jaEnviou.current) return;
    jaEnviou.current = true;

    confirmarEmail(token)
      .then((resposta) => setResultado({ ok: true, mensagem: resposta.mensagem }))
      .catch((erro) =>
        setResultado({
          ok: false,
          mensagem:
            erro instanceof ApiError ? erro.message : "Não foi possível conectar ao servidor.",
        }),
      );
  }, [token]);

  if (!resultado) return <Carregando />;

  return <Resultado ok={resultado.ok} mensagem={resultado.mensagem} />;
}

function Resultado({ ok, mensagem }: { ok: boolean; mensagem: string }) {
  return (
    <div style={{ animation: "rise 0.35s ease-out both" }}>
      <span
        className={`mb-6 flex h-[54px] w-[54px] items-center justify-center rounded-2xl ${
          ok ? "bg-verde/12 text-verde" : "bg-erro-lavagem text-erro"
        }`}
      >
        {ok ? (
          <CircleCheckBig size={26} strokeWidth={1.9} />
        ) : (
          <TriangleAlert size={26} strokeWidth={1.9} />
        )}
      </span>

      <h1 className="font-serif text-[34px] font-medium leading-tight tracking-[-0.02em]">
        {ok ? "Tudo certo" : "Não deu para confirmar"}
      </h1>
      <p className="mt-3 text-[16px] leading-relaxed text-tinta-2">{mensagem}</p>

      <Link href="/login" className={`${CLASSE_BOTAO} no-underline`}>
        {ok ? "Entrar agora" : "Voltar para o login"}
      </Link>
    </div>
  );
}

function Carregando() {
  return (
    <div className="flex items-center gap-3 py-8 text-[15px] text-suave">
      <Loader2 size={20} className="animate-spin text-terracota" />
      Confirmando seu e-mail...
    </div>
  );
}
