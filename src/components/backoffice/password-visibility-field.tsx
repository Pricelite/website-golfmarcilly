"use client";

import { useState } from "react";

export function PasswordVisibilityField() {
  const [visible, setVisible] = useState(false);

  return <div className="text-sm">
    <label htmlFor="restaurant-password">Mot de passe</label>
    <div className="relative mt-1">
      <input
        id="restaurant-password"
        name="password"
        type={visible ? "text" : "password"}
        autoComplete="current-password"
        required
        className="w-full rounded-lg border border-emerald-950/20 px-3 py-2 pr-12"
      />
      <button
        type="button"
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        aria-pressed={visible}
        onClick={() => setVisible((current) => !current)}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-emerald-950/70 hover:text-emerald-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
          <circle cx="12" cy="12" r="3" />
          {visible ? <path d="M3 21 21 3" /> : null}
        </svg>
      </button>
    </div>
  </div>;
}
