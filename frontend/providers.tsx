"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { ProvedorAlerta } from "@/lib/alerta";

// Component Providers
export default function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );

  // Retorna o QueryClientProvider com os Avisos em Modal
  return (
    <QueryClientProvider client={client}>
      <ProvedorAlerta>{children}</ProvedorAlerta>
    </QueryClientProvider>
  );
}
