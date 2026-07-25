export default function Skeletons() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-[14px] border border-borda bg-superficie p-5"
          style={{ animation: "sk 1.3s ease-in-out infinite" }}
        >
          <div className="mb-3 h-3.5 w-3/5 rounded bg-borda-forte" />
          <div className="mb-5 h-2.5 w-2/5 rounded bg-creme" />
          <div className="mb-2 h-2.5 w-full rounded bg-[#efe8da]" />
          <div className="h-2.5 w-4/5 rounded bg-[#efe8da]" />
        </div>
      ))}
    </div>
  );
}
