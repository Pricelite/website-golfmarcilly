/** Public messages are controlled here, never copied from a provider response. */
export function getFormErrorMessage(status: number): string {
  if (status === 400 || status === 422) {
    return "Vérifiez les informations saisies, puis renvoyez votre demande.";
  }
  if (status === 403) {
    return "Votre demande n’a pas pu être envoyée. Rechargez la page et réessayez.";
  }
  if (status === 429) {
    return "Vous avez effectué plusieurs tentatives. Patientez quelques minutes avant de réessayer.";
  }
  return "L’envoi est momentanément indisponible. Réessayez plus tard ou appelez le golf au 02 38 76 11 73.";
}

export const FORM_NETWORK_ERROR =
  "La réception de votre demande n’a pas pu être vérifiée. Vérifiez votre connexion ou appelez le golf avant de renouveler votre demande.";
