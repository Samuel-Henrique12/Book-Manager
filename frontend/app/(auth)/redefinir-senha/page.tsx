"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CircleCheckBig, Loader2, Lock, TriangleAlert } from "lucide-react";
import { redefinirSenha } from "@/lib/contas";
import { ApiError } from "@/lib/api";
import { useAlerta } from "@/lib/alerta";
import CampoFormulario from "@/components/CampoFormulario";
import Cabecalho, { CLASSE_BOTAO } from "@/components/login/Cabecalho";

const schema = z
  .object({
    senha: z.string().min(4, "Mínimo de 4 caracteres").max(100, "Máximo de 100 caracteres"),
    confirmacao: z.string().min(1, "Repita a nova senha"),
  })
  .refine((dados) => dados.senha === dados.confirmacao, {
    message: "As senhas não coincidem",
    path: ["confirmacao"],
  });

type Formulario = z.infer<typeof schema>;

export default function PaginaRedefinirSenha() {
  return (
    <Suspense fallback={<Espera />}>
      <Redefinicao />
    </Suspense>
  );
}

function Redefinicao() {
  const router = useRouter();
  const alerta = useAlerta();
  const token = useSearchParams().get("token");
  const [concluido, setConcluido] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Formulario>({ resolver: zodResolver(schema) });

  async function aoEnviar(dados: Formulario) {
    if (!token) return;
    try {
      await redefinirSenha({ token, senha: dados.senha });
      setConcluido(true);
    } catch (erro) {
      if (erro instanceof ApiError && erro.campos?.senha) {
        setError("senha", { message: erro.campos.senha });
        return;
      }
      alerta.erro(
        erro instanceof ApiError ? erro.message : "Não foi possível conectar ao servidor",
      );
    }
  }

  if (!token) {
    return (
      <Resultado
        tom="erro"
        titulo="Link incompleto"
        texto="Este endereço não traz um token válido. Abra o e-mail e clique no botão novamente."
        acao="Pedir novo link"
        href="/esqueci-senha"
      />
    );
  }

  if (concluido) {
    return (
      <Resultado
        tom="ok"
        titulo="Senha alterada"
        texto="Sua nova senha já está valendo e sua sessão foi aberta."
        acao="Entrar"
        // Entrar na Sessão
        aoAgir={() => {
          router.replace("/");
          router.refresh();
        }}
      />
    );
  }

  return (
    <>
      <Cabecalho
        linha1="Escolha uma"
        linha2="nova senha"
        subtitulo="Depois de salvar, este link deixa de funcionar."
      />

      <form onSubmit={handleSubmit(aoEnviar)} noValidate>
        <CampoFormulario
          rotulo="Nova senha"
          placeholder="Nova senha (mínimo 4 caracteres)"
          senha
          autoComplete="new-password"
          autoFocus
          icone={<Lock size={19} strokeWidth={1.7} />}
          erro={errors.senha?.message}
          {...register("senha")}
        />

        <CampoFormulario
          className="mt-3.5"
          rotulo="Repetir nova senha"
          placeholder="Repita a nova senha"
          senha
          autoComplete="new-password"
          icone={<Lock size={19} strokeWidth={1.7} />}
          erro={errors.confirmacao?.message}
          {...register("confirmacao")}
        />

        <button type="submit" disabled={isSubmitting} className={CLASSE_BOTAO}>
          {isSubmitting && <Loader2 size={17} className="animate-spin" />}
          {isSubmitting ? "Salvando..." : "Salvar nova senha"}
        </button>
      </form>

      <p className="mt-8 text-center text-[14px] text-suave">
        <Link
          href="/login"
          className="font-semibold text-terracota transition hover:text-terracota-escuro hover:underline"
        >
          Voltar para o login
        </Link>
      </p>
    </>
  );
}

function Resultado({
  tom,
  titulo,
  texto,
  acao,
  href,
  aoAgir,
}: {
  tom: "ok" | "erro";
  titulo: string;
  texto: string;
  acao: string;
  href?: string;
  aoAgir?: () => void;
}) {
  const ok = tom === "ok";
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
        {titulo}
      </h1>
      <p className="mt-3 text-[16px] leading-relaxed text-tinta-2">{texto}</p>
      {aoAgir ? (
        <button type="button" onClick={aoAgir} className={CLASSE_BOTAO}>
          {acao}
        </button>
      ) : (
        <Link href={href ?? "/login"} className={`${CLASSE_BOTAO} no-underline`}>
          {acao}
        </Link>
      )}
    </div>
  );
}

function Espera() {
  return (
    <div className="flex items-center gap-3 py-8 text-[15px] text-suave">
      <Loader2 size={20} className="animate-spin text-terracota" />
      Carregando...
    </div>
  );
}
