"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail, MailCheck } from "lucide-react";
import { solicitarRedefinicao } from "@/lib/contas";
import { ApiError } from "@/lib/api";
import { useAlerta } from "@/lib/alerta";
import CampoFormulario from "@/components/CampoFormulario";
import Cabecalho, { CLASSE_BOTAO } from "@/components/login/Cabecalho";
import { mascararEmail } from "@/components/login/AvisoConfirmacao";

const schema = z.object({
  email: z.string().min(1, "Informe seu e-mail").email("Informe um e-mail válido"),
});

type Formulario = z.infer<typeof schema>;

export default function PaginaEsqueciSenha() {
  const alerta = useAlerta();
  const [enviadoPara, setEnviadoPara] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Formulario>({ resolver: zodResolver(schema) });

  async function aoEnviar(dados: Formulario) {
    try {
      await solicitarRedefinicao(dados.email);
      setEnviadoPara(dados.email);
    } catch (erro) {
      alerta.erro(
        erro instanceof ApiError ? erro.message : "Não foi possível conectar ao servidor",
      );
    }
  }

  if (enviadoPara) {
    return (
      <div style={{ animation: "rise 0.35s ease-out both" }}>
        <span className="mb-6 flex h-[54px] w-[54px] items-center justify-center rounded-2xl bg-terracota-lavagem text-terracota">
          <MailCheck size={26} strokeWidth={1.8} />
        </span>

        <h1 className="font-serif text-[34px] font-medium leading-tight tracking-[-0.02em]">
          Verifique seu e-mail
        </h1>
        <p className="mt-3 text-[16px] leading-relaxed text-tinta-2">
          Se <strong className="font-semibold text-tinta">{mascararEmail(enviadoPara)}</strong>{" "}
          estiver cadastrado, o link de redefinição chega em instantes.
        </p>

        <p className="mt-4 rounded-xl border border-borda bg-superficie-2 px-4 py-3 text-[13.5px] leading-relaxed text-suave">
          O link vale por 1 hora e só pode ser usado uma vez.
        </p>

        <Link href="/login" className={`${CLASSE_BOTAO} no-underline`}>
          Voltar para o login
        </Link>
      </div>
    );
  }

  return (
    <>
      <Cabecalho
        linha1="Esqueceu a senha?"
        linha2="Acontece"
        subtitulo="Informe o e-mail da conta e enviamos um link para você criar uma nova."
      />

      <form onSubmit={handleSubmit(aoEnviar)} noValidate>
        <CampoFormulario
          rotulo="E-mail"
          placeholder="E-mail"
          tipo="email"
          autoComplete="email"
          autoFocus
          icone={<Mail size={19} strokeWidth={1.7} />}
          erro={errors.email?.message}
          {...register("email")}
        />

        <button type="submit" disabled={isSubmitting} className={CLASSE_BOTAO}>
          {isSubmitting && <Loader2 size={17} className="animate-spin" />}
          {isSubmitting ? "Enviando..." : "Enviar link de redefinição"}
        </button>
      </form>

      <p className="mt-8 text-center text-[14px] text-suave">
        Lembrou a senha?{" "}
        <Link
          href="/login"
          className="font-semibold text-terracota transition hover:text-terracota-escuro hover:underline"
        >
          Entrar
        </Link>
      </p>
    </>
  );
}
