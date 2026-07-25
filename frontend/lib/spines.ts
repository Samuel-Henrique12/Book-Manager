const PALETA = [
  "#c0451f",
  "#2f6b4f",
  "#3b5ba5",
  "#8a5a2b",
  "#b08313",
  "#7a3e6b",
  "#4a4e69",
  "#9e3717",
  "#3d7068",
  "#8a2b4a",
];

export function corLombada(semente: number | string): string {
  const n =
    typeof semente === "number"
      ? semente
      : Array.from(semente).reduce((soma, ch) => soma + ch.charCodeAt(0), 0);
  return PALETA[Math.abs(n) % PALETA.length];
}

export function iniciais(titulo: string): string {
  return (
    (titulo || "?")
      .split(/\s+/)
      .filter((palavra) => /[A-Za-zÀ-ú]/.test(palavra[0] || ""))
      .slice(0, 2)
      .map((palavra) => palavra[0].toUpperCase())
      .join("") || "?"
  );
}
