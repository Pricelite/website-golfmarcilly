export function FAQAccordion({
  items,
}: {
  items: ReadonlyArray<{ question: string; answer: string }>;
}) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <details key={item.question} open={index === 0} className="group rounded-[24px] border border-emerald-950/10 bg-white/85">
          <summary className="site-button flex cursor-pointer list-none items-center justify-between gap-4 rounded-[24px] px-5 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 [&::-webkit-details-marker]:hidden">
            <span className="font-medium">{item.question}</span>
            <span aria-hidden="true" className="text-xl group-open:hidden">+</span>
            <span aria-hidden="true" className="hidden text-xl group-open:inline">−</span>
          </summary>
          <p className="px-5 pb-5 text-sm leading-7 text-emerald-950/75">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
