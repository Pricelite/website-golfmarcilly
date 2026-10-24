import { initiationExperience, initiationInclusions } from "@/data/initiation-experience";

export function InitiationProgram({ withMeal }: { withMeal: boolean }) {
  return <div className="rounded-2xl border border-emerald-950/15 bg-emerald-50/60 p-4 text-sm text-emerald-950">
    <p className="font-semibold">Votre programme · {withMeal ? initiationExperience.withMealDuration : initiationExperience.withoutMealDuration}</p>
    <ul className="mt-3 space-y-2 leading-6">
      {initiationInclusions(withMeal).map(item => <li key={item} className="flex gap-2"><span aria-hidden="true" className="text-emerald-700">✓</span>{item}</li>)}
    </ul>
  </div>;
}
