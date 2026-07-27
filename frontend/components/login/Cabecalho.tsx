// Título em Duas Linhas das Telas de Autenticação
export default function Cabecalho({
  linha1,
  linha2,
  subtitulo,
}: {
  linha1: string;
  linha2: string;
  subtitulo: string;
}) {
  return (
    <>
      <h1 className="font-serif text-[42px] font-medium leading-[1.07] tracking-[-0.02em] xl:text-[50px]">
        <span className="block text-tinta">{linha1}</span>
        <span className="block text-terracota">{linha2}</span>
      </h1>
      <p className="mb-9 mt-4 max-w-[340px] text-[16px] leading-relaxed text-tinta-2">
        {subtitulo}
      </p>
    </>
  );
}

export const CLASSE_BOTAO =
  "mt-7 flex h-[56px] w-full items-center justify-center gap-2.5 rounded-xl bg-terracota text-[16px] font-semibold text-white transition hover:bg-terracota-escuro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracota disabled:opacity-70";
