"use client";

import { useQuery } from "@tanstack/react-query";
import { obterMinhaConta } from "./usuarios";

export const CHAVE_CONTA = ["conta"] as const;

// Dados da Conta Autenticada Compartilhados entre Telas
export function useConta() {
  return useQuery({
    queryKey: CHAVE_CONTA,
    queryFn: obterMinhaConta,
    staleTime: 5 * 60 * 1000,
  });
}
