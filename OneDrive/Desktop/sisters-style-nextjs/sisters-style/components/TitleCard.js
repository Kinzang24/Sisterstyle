export default function TitleCard({ crumb, title, subtitle }) {
  return (
    <div className="mb-6 inline-block rounded-2xl border border-line bg-white/92 px-5 py-3 shadow-[0_6px_18px_-10px_rgba(42,33,30,0.25)]">
      <div className="mb-1.5 text-[13px] text-ink-soft">
        Home <span className="mx-1">»</span>{" "}
        <b className="font-bold text-clay-warm">{crumb}</b>
      </div>
      <h1 className="font-display m-0 flex items-center gap-2 text-[26px] font-semibold">
        <span className="inline-block h-[9px] w-[9px] rounded-full bg-clay-warm" />
        {title}
      </h1>
      {subtitle && <div className="mt-1 text-[12.5px] text-ink-soft">{subtitle}</div>}
    </div>
  );
}
