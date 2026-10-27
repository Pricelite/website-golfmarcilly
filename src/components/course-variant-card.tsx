"use client";

import { useState } from "react";
import { CourseCard } from "@/components/ui/course-card";
import type { PricingSection } from "@/data/pricing";
import { courses } from "@/data/courses";

type Course = (typeof courses)[number];

export function CourseVariantCard({ id, first, second, firstLabel, secondLabel, firstPricing, secondPricing, headingLevel = "h3" }: {
  id?: string;
  first: Course;
  second: Course;
  firstLabel: string;
  secondLabel: string;
  firstPricing?: PricingSection;
  secondPricing?: PricingSection;
  headingLevel?: "h2" | "h3";
}) {
  const [selected, setSelected] = useState<"first" | "second">("first");
  const course = selected === "first" ? first : second;

  return <CourseCard
    {...course}
    id={id}
    headingLevel={headingLevel}
    pricing={selected === "first" ? firstPricing : secondPricing}
    switcher={<div role="group" aria-label="Choisir un parcours" className="flex flex-wrap gap-2">
      {(["first", "second"] as const).map(value => <button
        key={value}
        type="button"
        aria-pressed={selected === value}
        onClick={() => setSelected(value)}
        className={`min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${selected === value ? "border-emerald-900 bg-emerald-900 text-white" : "border-emerald-900/20 bg-white text-emerald-950 hover:bg-emerald-50"}`}
      >{value === "first" ? firstLabel : secondLabel}</button>)}
    </div>}
  />;
}
