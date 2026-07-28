import { useCallback } from "react";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiError } from "./api";
import { useAlerta } from "./alerta";

const MENSAGEM_PADRAO = "Não foi possível conectar ao servidor";

// Erros por Campo Ficam sob o Input; Falhas Gerais Viram Modal
export function useAplicarErro() {
  const alerta = useAlerta();

  return useCallback(
    <T extends FieldValues>(
      erro: unknown,
      setError: UseFormSetError<T>,
      mensagemPadrao = MENSAGEM_PADRAO,
    ) => {
      if (erro instanceof ApiError && erro.campos) {
        Object.entries(erro.campos).forEach(([campo, mensagem]) =>
          setError(campo as Path<T>, { message: mensagem }),
        );
        return;
      }
      alerta.erro(erro instanceof ApiError ? erro.message : mensagemPadrao);
    },
    [alerta],
  );
}
