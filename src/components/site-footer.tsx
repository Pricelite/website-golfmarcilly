const googleReviewUrl =
  "https://www.google.com/search?sca_esv=fc7fb3900d27d98e&rlz=1C1CHBF_frFR1183FR1183&sxsrf=ANbL-n51CAn7pmF6ifIi-eI28wuThryJKQ:1770466832235&q=golf+de+marcilly&si=AL3DRZHrmvnFAVQPOO2Bzhf8AX9KZZ6raUI_dT7DG_z0kV2_x23MOSeoEFh4vC2LBRPXFD1V2F_jTRO5kB88BUdfMe3g6UTkKed4JodrrblNHew6Obq_5ks%3D&uds=ALYpb_k6otuSYDT1zFYqBpNGDSzKYMjvwyaiyohXCVIZu88f7kNKnXdqNGuOESy8ak6thFtR4Wt_TTpdXYieOWImes85zhlHoT0wBgeRQZ2nit1VZwpk1ks&sa=X&sqi=2&ved=2ahUKEwj5zPz0rseSAxXLZqQEHR2JIuwQ3PALegQIGhAE&biw=1536&bih=738&dpr=1.25";

export default function SiteFooter() {
  return (
    <footer id="contact" className="mt-12 border-t border-emerald-900/10 bg-white/70">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10 md:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-700">
            Contact
          </p>
          <h2 className="mt-3 font-[var(--font-display)] text-2xl text-emerald-950">
            Golf de Marcilly-Orléans
          </h2>
          <div className="mt-4 space-y-2 text-sm text-emerald-900/70">
            <p>829 domaine de la Plaine, 45240 Marcilly-en-Villette</p>
            <p>02 38 76 11 73</p>
            <p>golf@marcilly.com</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 text-sm font-semibold text-emerald-900">
            <a
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-900/20 bg-white text-emerald-900 transition hover:border-emerald-900/40 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              href="https://www.facebook.com/golfdemarcilly"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="currentColor"
              >
                <path d="M13.2 21v-8.2h2.8l.4-3.2h-3.2V7.1c0-.9.3-1.6 1.6-1.6h1.7V2.6c-.3 0-1.4-.1-2.7-.1-2.7 0-4.5 1.6-4.5 4.6v2.5H7v3.2h2.3V21h3.9z" />
              </svg>
            </a>
          </div>
          <a
            className="inline-flex w-full items-center justify-center rounded-full bg-emerald-900 px-6 py-3 text-sm font-semibold text-emerald-50 shadow-lg shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:bg-emerald-800 md:w-auto"
            href={googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Donner mon avis sur Google
          </a>
        </div>
      </div>
    </footer>
  );
}
