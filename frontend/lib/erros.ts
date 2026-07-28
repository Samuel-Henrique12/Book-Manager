import { toast } from "sonner";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiError } from "./api";

// Erros por Campo do ProblemDetail Viram Erro do Formulário; o Resto Vira Toast
export function aplicarErro<T extends FieldValues>(
  erro: unknown,
  setError: UseFormSetError<T>,
  mensagemPadrao = "Não foi possível conectar ao servidor",
) {
  if (erro instanceof ApiError && erro.campos) {
    Object.entries(erro.campos).forEach(([campo, mensagem]) =>
      setError(campo as Path<T>, { message: mensagem }),
    );
    return;
  }
  toast.error(erro instanceof ApiError ? erro.message : mensagemPadrao);
}
