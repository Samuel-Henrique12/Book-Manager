"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import ModalAlerta, { type TipoAlerta } from "@/components/ui/ModalAlerta";

interface Conteudo {
  tipo: TipoAlerta;
  titulo: string;
  texto?: string;
}

// Quando Modal Fecha, Promise Resolve — Permite Encadear Navegação
type Exibir = (titulo: string, texto?: string) => Promise<void>;

interface Alerta {
  sucesso: Exibir;
  erro: Exibir;
  aviso: Exibir;
}

const ContextoAlerta = createContext<Alerta | null>(null);

export function ProvedorAlerta({ children }: { children: ReactNode }) {
  const [conteudo, setConteudo] = useState<Conteudo | null>(null);
  const resolver = useRef<(() => void) | null>(null);

  const concluir = useCallback(() => {
    resolver.current?.();
    resolver.current = null;
  }, []);

  const fechar = useCallback(() => {
    setConteudo(null);
    concluir();
  }, [concluir]);

  const abrir = useCallback(
    (tipo: TipoAlerta): Exibir =>
      (titulo, texto) => {
        // Um Alerta Pendente Nao Trava a Promise do Anterior
        concluir();
        setConteudo({ tipo, titulo, texto });
        return new Promise<void>((resolve) => {
          resolver.current = resolve;
        });
      },
    [concluir],
  );

  const alerta = useMemo<Alerta>(
    () => ({ sucesso: abrir("sucesso"), erro: abrir("erro"), aviso: abrir("aviso") }),
    [abrir],
  );

  return (
    <ContextoAlerta.Provider value={alerta}>
      {children}
      {conteudo && <ModalAlerta {...conteudo} aoFechar={fechar} />}
    </ContextoAlerta.Provider>
  );
}

export function useAlerta(): Alerta {
  const contexto = useContext(ContextoAlerta);
  if (!contexto) {
    throw new Error("useAlerta precisa estar dentro de ProvedorAlerta");
  }
  return contexto;
}
