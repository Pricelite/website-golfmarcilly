"use client";

import { useState } from "react";
import { CTAButton } from "@/components/ui/cta-button";

type Choice = { label: string; title: string; description: string; price: string; unit: string; href: string; action: string };

export function BeginnerFormulaPicker({ choices }: { choices: Choice[] }) {
  const [selected, setSelected] = useState(0);
  const choice = choices[selected];
  return (
    <div className="overflow-hidden rounded-[28px] border border-emerald-950/15 bg-white shadow-sm">
      <div className="p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">À vous de choisir</p>
        <h2 className="mt-3 font-serif text-3xl text-emerald-950">Votre première envie ?</h2>
        <div role="group" aria-label="Choisir votre découverte du golf" className="mt-6 flex flex-col gap-3">
          {choices.map((item, index) => <button key={item.label} type="button" aria-pressed={index === selected} onClick={() => setSelected(index)} className={`flex min-h-12 items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${index === selected ? "border-emerald-900 bg-emerald-900 text-white" : "border-emerald-950/15 text-emerald-950 hover:bg-stone-50"}`}>
            {item.label}<span aria-hidden="true">{index === selected ? "✓" : "→"}</span>
          </button>)}
        </div>
      </div>
      <div aria-live="polite" aria-atomic="true" className="border-t border-emerald-950/10 bg-[#f0f3e8] p-6 sm:p-8">
        <h3 className="font-serif text-2xl text-emerald-950">{choice.title}</h3>
        <p className="mt-3 text-sm leading-7 text-emerald-950/75">{choice.description}</p>
        <p className="my-5 text-emerald-950"><span className="font-serif text-4xl">{choice.price}</span><span className="ml-2 text-sm">{choice.unit}</span></p>
        <CTAButton href={choice.href}>{choice.action}</CTAButton>
      </div>
    </div>
  );
}
