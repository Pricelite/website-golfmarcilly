type AssociationPortraitProps = {
  name: string;
  position: readonly [number, number] | null;
};

export function AssociationPortrait({ name, position }: AssociationPortraitProps) {
  const initials = name.split(" ").map((part) => part[0]).join("");

  return (
    <span
      aria-hidden="true"
      className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-emerald-950/15 bg-[#e6d4a2] text-sm font-semibold text-emerald-950"
      style={position ? {
        backgroundImage: "url('/images/organigramme-association-sportive.webp')",
        backgroundPosition: `${32 - position[0]}px ${32 - position[1]}px`,
        backgroundSize: "1025px 768px",
      } : undefined}
    >
      {position ? null : initials}
    </span>
  );
}
