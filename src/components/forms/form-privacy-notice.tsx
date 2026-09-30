import Link from "next/link";

type FormPrivacyNoticeProps = {
  purpose: string;
};

export function FormPrivacyNotice({ purpose }: FormPrivacyNoticeProps) {
  return (
    <p className="text-xs leading-6 text-emerald-950/65">
      Les informations saisies sont utilisées par le Golf de Marcilly-Orléans
      pour {purpose}. Leur traitement est nécessaire pour répondre à votre
      demande et prendre, à votre demande, les mesures préalables à une
      éventuelle prestation. Vous pouvez exercer vos droits auprès de{" "}
      <Link className="underline underline-offset-4" href="/politique-de-confidentialite">
        notre politique de confidentialité
      </Link>
      .
    </p>
  );
}
