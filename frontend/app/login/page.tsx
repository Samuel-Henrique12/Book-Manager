"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type FieldValues, type Path, type UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { BookMarked, Loader2 } from "lucide-react";
import { entrar, registrar } from "@/lib/contas";
import { ApiError } from "@/lib/api";

// Schemas de Validação com Zod
const loginSchema = z.object({
  email: z.string().min(1, "Informe seu e-mail").email("Informe um e-mail válido"),
  senha: z.string().min(1, "Informe sua senha"),
});
const registroSchema = z.object({
  nome: z.string().min(1, "Informe seu nome"),
  email: z.string().min(1, "Informe seu e-mail").email("Informe um e-mail válido"),
  senha: z.string().min(4, "Mínimo de 4 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegistroForm = z.infer<typeof registroSchema>;

// Classes de Estilo
const CLASSE_INPUT =
  "w-full rounded-[10px] border border-borda-forte bg-superficie px-3.5 py-3 text-[15px] text-tinta transition focus:border-terracota focus:shadow-[0_0_0_3px_rgba(192,69,31,0.12)]";
const CLASSE_INPUT_ERRO = "border-erro bg-[#fbeee9]";
const CLASSE_LABEL = "mb-1.5 block text-[13px] font-semibold text-[#5c554b]";
const CLASSE_ERRO = "mt-1.5 text-[13px] text-erro";
const CLASSE_BOTAO =
  "mt-6 flex w-full items-center justify-center gap-2.5 rounded-[10px] bg-terracota py-3.5 text-[15px] font-semibold text-white transition hover:bg-terracota-escuro disabled:opacity-70";

export default function PaginaLogin() {
  const [modo, setModo] = useState<"login" | "registro">("login");

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[1.05fr_1fr]">
      <PainelMarca />
      <div className="flex items-center justify-center p-10">
        <div className="w-full max-w-[380px]">
          {modo === "login" ? (
            <FormularioLogin aoTrocar={() => setModo("registro")} />
          ) : (
            <FormularioRegistro aoTrocar={() => setModo("login")} />
          )}
        </div>
      </div>
    </div>
  );
}

function PainelMarca() {
  const lombadas = [
    { h: 96, c: "#c0451f" },
    { h: 78, c: "#2f6b4f" },
    { h: 104, c: "#b08313" },
    { h: 70, c: "#3b5ba5" },
    { h: 88, c: "#7a3e6b" },
    { h: 62, c: "#8a5a2b" },
  ];
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-painel p-14 text-papel md:flex">
      <div className="relative z-10 flex items-center gap-3">
        <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[9px] bg-terracota text-papel">
          <BookMarked size={20} strokeWidth={1.8} />
        </div>
        <span className="font-serif text-[22px] font-medium">Book Manager</span>
      </div>
      <div className="relative z-10 max-w-[440px]">
        <p className="mb-4 font-serif text-[40px] leading-[1.18] text-pretty">
          Toda a sua estante, organizada em um só lugar.
        </p>
        <p className="text-[16px] leading-relaxed text-[#c9c0ae]">
          Cadastre, busque e mantenha seus livros sempre à mão — com uma interface pensada nos
          detalhes.
        </p>
      </div>
      <div className="relative z-10 flex h-[110px] items-end gap-2">
        {lombadas.map((l, i) => (
          <div
            key={i}
            className="w-[26px] rounded-t"
            style={{ height: l.h, background: l.c }}
          />
        ))}
      </div>
      <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(192,69,31,0.35),transparent_70%)]" />
    </div>
  );
}

function FormularioLogin({ aoTrocar }: { aoTrocar: () => void }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  async function aoEnviar(dados: LoginForm) {
    try {
      await entrar(dados);
      toast.success("Login realizado com sucesso");
      router.push("/books");
      router.refresh();
    } catch (erro) {
      aplicarErro(erro, setError);
    }
  }

  return (
    <>
      <h1 className="mb-1.5 font-serif text-[32px] font-medium">Entrar</h1>
      <p className="mb-7 text-[15px] text-suave">Acesse sua biblioteca pessoal.</p>
      <form onSubmit={handleSubmit(aoEnviar)} noValidate>
        <label className={CLASSE_LABEL}>E-mail</label>
        <input
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          className={`${CLASSE_INPUT} ${errors.email ? CLASSE_INPUT_ERRO : ""}`}
          {...register("email")}
        />
        {errors.email && <p className={CLASSE_ERRO}>{errors.email.message}</p>}

        <label className={`${CLASSE_LABEL} mt-[18px]`}>Senha</label>
        <input
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          className={`${CLASSE_INPUT} ${errors.senha ? CLASSE_INPUT_ERRO : ""}`}
          {...register("senha")}
        />
        {errors.senha && <p className={CLASSE_ERRO}>{errors.senha.message}</p>}

        <button type="submit" disabled={isSubmitting} className={CLASSE_BOTAO}>
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <p className="mt-6 text-center text-[14px] text-suave">
        Não tem conta?{" "}
        <button onClick={aoTrocar} className="font-semibold text-terracota hover:underline">
          Criar conta
        </button>
      </p>
    </>
  );
}

function FormularioRegistro({ aoTrocar }: { aoTrocar: () => void }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegistroForm>({ resolver: zodResolver(registroSchema) });

  async function aoEnviar(dados: RegistroForm) {
    try {
      await registrar(dados);
      toast.success("Conta criada com sucesso");
      router.push("/books");
      router.refresh();
    } catch (erro) {
      aplicarErro(erro, setError);
    }
  }

  return (
    <>
      <h1 className="mb-1.5 font-serif text-[32px] font-medium">Criar conta</h1>
      <p className="mb-7 text-[15px] text-suave">Leva menos de um minuto.</p>
      <form onSubmit={handleSubmit(aoEnviar)} noValidate>
        <label className={CLASSE_LABEL}>Nome</label>
        <input
          type="text"
          autoComplete="name"
          placeholder="Seu nome"
          className={`${CLASSE_INPUT} ${errors.nome ? CLASSE_INPUT_ERRO : ""}`}
          {...register("nome")}
        />
        {errors.nome && <p className={CLASSE_ERRO}>{errors.nome.message}</p>}

        <label className={`${CLASSE_LABEL} mt-[18px]`}>E-mail</label>
        <input
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          className={`${CLASSE_INPUT} ${errors.email ? CLASSE_INPUT_ERRO : ""}`}
          {...register("email")}
        />
        {errors.email && <p className={CLASSE_ERRO}>{errors.email.message}</p>}

        <label className={`${CLASSE_LABEL} mt-[18px]`}>Senha</label>
        <input
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo 4 caracteres"
          className={`${CLASSE_INPUT} ${errors.senha ? CLASSE_INPUT_ERRO : ""}`}
          {...register("senha")}
        />
        {errors.senha && <p className={CLASSE_ERRO}>{errors.senha.message}</p>}

        <button type="submit" disabled={isSubmitting} className={CLASSE_BOTAO}>
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? "Criando..." : "Criar conta"}
        </button>
      </form>
      <p className="mt-6 text-center text-[14px] text-suave">
        Já tem conta?{" "}
        <button onClick={aoTrocar} className="font-semibold text-terracota hover:underline">
          Entrar
        </button>
      </p>
    </>
  );
}

function aplicarErro<T extends FieldValues>(erro: unknown, setError: UseFormSetError<T>) {
  if (erro instanceof ApiError && erro.campos) {
    Object.entries(erro.campos).forEach(([campo, mensagem]) =>
      setError(campo as Path<T>, { message: mensagem }),
    );
    return;
  }
  toast.error(erro instanceof ApiError ? erro.message : "Não foi possível conectar ao servidor");
}
