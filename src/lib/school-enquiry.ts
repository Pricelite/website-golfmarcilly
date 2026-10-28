import { juniorPrograms } from "@/data/teaching";
import { isNonEmptyWithinLength, isValidEmail, isWithinLength, parseTrimmedString } from "@/lib/api/public-form-validation";

export type SchoolEnquiry = {
  guardianFirstName: string;
  guardianLastName: string;
  email: string;
  phone: string;
  childFirstName: string;
  childAge: number;
  programTitle: string;
  preferredSlot: string;
  notes: string;
};

export function parseSchoolEnquiry(input: Record<string, unknown>): SchoolEnquiry | null {
  const program = juniorPrograms.find((item) => item.key === input.program);
  const childAge = input.childAge;
  const enquiry = {
    guardianFirstName: parseTrimmedString(input.guardianFirstName),
    guardianLastName: parseTrimmedString(input.guardianLastName),
    email: parseTrimmedString(input.email).toLowerCase(),
    phone: parseTrimmedString(input.phone),
    childFirstName: parseTrimmedString(input.childFirstName),
    childAge,
    programTitle: program?.title ?? "",
    preferredSlot: parseTrimmedString(input.preferredSlot),
    notes: parseTrimmedString(input.notes),
  };

  if (
    !program ||
    !isNonEmptyWithinLength(enquiry.guardianFirstName, 80) ||
    !isNonEmptyWithinLength(enquiry.guardianLastName, 80) ||
    !isNonEmptyWithinLength(enquiry.childFirstName, 80) ||
    !isNonEmptyWithinLength(enquiry.email, 160) ||
    !isValidEmail(enquiry.email) ||
    !isWithinLength(enquiry.phone, 30) ||
    !isWithinLength(enquiry.notes, 2000) ||
    (enquiry.preferredSlot !== "" && !program.slots.some((slot) => slot === enquiry.preferredSlot)) ||
    typeof childAge !== "number" ||
    !Number.isInteger(childAge) ||
    childAge < 4 ||
    childAge > 18
  ) return null;

  return { ...enquiry, childAge };
}

export function formatSchoolEnquiry(enquiry: SchoolEnquiry): string {
  return [
    "Nouvelle demande pour l’école de golf",
    "",
    `Parent ou responsable légal : ${enquiry.guardianFirstName} ${enquiry.guardianLastName}`,
    `Email : ${enquiry.email}`,
    `Téléphone : ${enquiry.phone || "Non renseigné"}`,
    `Prénom de l’enfant : ${enquiry.childFirstName}`,
    `Âge de l’enfant : ${enquiry.childAge} ans`,
    `Groupe souhaité : ${enquiry.programTitle}`,
    `Créneau souhaité : ${enquiry.preferredSlot || "À définir avec l’accueil"}`,
    `Précisions : ${enquiry.notes || "Aucune"}`,
    "",
    "Demande de renseignements ou d’inscription, à confirmer par l’équipe du golf.",
  ].join("\n");
}
