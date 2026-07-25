// Painel de Livros com Imagem de Fundo e Reforço de Luz
export default function PainelLivros({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-papel ${className}`}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "image-set(url('/login-livros-1024.webp') 1x, url('/login-livros.webp') 2x)",
          backgroundSize: "cover",
          backgroundPosition: "62% 50%",
          animation: "fade 0.9s ease-out both",
        }}
      />

      {/* Reforço de Luz Quente */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 22% 12%, rgba(255,224,168,0.28) 0%, rgba(255,224,168,0) 46%)",
        }}
      />

      {/* Derretimento no Painel Claro */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, var(--color-papel) 0%, rgba(247,244,239,0.94) 5%, rgba(247,244,239,0.72) 13%, rgba(247,244,239,0.34) 24%, rgba(247,244,239,0) 38%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[16%]"
        style={{
          background: "linear-gradient(180deg, rgba(247,244,239,0.62) 0%, rgba(247,244,239,0) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[16%]"
        style={{
          background: "linear-gradient(0deg, rgba(247,244,239,0.62) 0%, rgba(247,244,239,0) 100%)",
        }}
      />
    </div>
  );
}
