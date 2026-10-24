const errors: Record<string, string> = {
  invalid: "Adresse e-mail ou mot de passe incorrect.",
  rate_limited: "Trop de tentatives. Réessayez dans quelques minutes.",
  unavailable: "La connexion est momentanément indisponible.",
  origin_denied: "Cette demande de connexion a été refusée par le contrôle de sécurité.",
  unsafe_url: "Pour protéger votre mot de passe, saisissez-le à nouveau dans ce formulaire.",
};

export function LoginForm({ error }: { error?: string }) {
  return <form action="/api/backoffice/session" method="post" className="mt-8 space-y-5 rounded-3xl border border-emerald-950/10 bg-white p-6 shadow-sm">
    <label className="block text-sm font-medium text-emerald-950">Adresse e-mail<input name="email" type="email" autoComplete="username" required maxLength={254} className="mt-2 w-full rounded-xl border border-emerald-950/20 px-4 py-3" /></label>
    <label className="block text-sm font-medium text-emerald-950">Mot de passe<input name="password" type="password" autoComplete="current-password" required className="mt-2 w-full rounded-xl border border-emerald-950/20 px-4 py-3" /></label>
    {error ? <p role="alert" className="text-sm text-red-700">{errors[error] ?? errors.invalid}</p> : null}
    <button type="submit" className="site-button w-full">Se connecter</button>
  </form>;
}
