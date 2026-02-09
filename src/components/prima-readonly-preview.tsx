import { PRIMA_URL } from "@/lib/prima";

type PrimaReadonlyPreviewProps = {
  title?: string;
  src?: string;
};

export default function PrimaReadonlyPreview({
  title = "Planning Prima Golf",
  src = PRIMA_URL,
}: PrimaReadonlyPreviewProps) {
  return (
    <div className="mt-4 aspect-[16/10] overflow-hidden rounded-2xl border border-emerald-900/10 bg-white">
      <iframe
        src={src}
        title={title}
        className="h-full w-full border-0"
        loading="lazy"
      />
    </div>
  );
}
