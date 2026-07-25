"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Toaster } from "sonner";

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

  // Retorna o QueryClientProvider com Toaster
  return (
    <QueryClientProvider client={client}>
      {children}
      <Toaster
        position="bottom-center"
        toastOptions={{ style: { background: "#211e19", color: "#f4efe3", border: "none" } }}
      />
    </QueryClientProvider>
  );
}