export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width="38" height="38" viewBox="0 0 40 40" aria-hidden>
        <circle cx="20" cy="20" r="20" fill="#FFC233" />
        <path d="M0 24 Q10 17 20 24 T40 24 V40 H0Z" fill="#0EA5B7" />
        <path d="M0 29 Q10 22 20 29 T40 29 V40 H0Z" fill="#06303F" opacity=".85" />
      </svg>
      <span className={`font-display text-xl font-extrabold leading-none ${light ? "text-white" : "text-deep"}`}>
        Maré<span className="text-coral"> Lençóis</span>
      </span>
    </span>
  );
}
