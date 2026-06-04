export function TestimonialCard({
  quote,
  name,
  role,
}: {
  quote: string;
  name: string;
  role: string;
}) {
  return (
    <figure className="rounded-[28px] border border-emerald-950/10 bg-white/80 p-7 shadow-sm shadow-emerald-950/5">
      <blockquote className="text-sm leading-7 text-emerald-950/78">
        “{quote}”
      </blockquote>
      <figcaption className="mt-5">
        <p className="font-semibold text-emerald-950">{name}</p>
        <p className="text-sm text-emerald-700">{role}</p>
      </figcaption>
    </figure>
  );
}
