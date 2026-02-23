export type InitiationMealOption = "WITH_MEAL" | "WITHOUT_MEAL";

export type InitiationReservationStatus =
  | "PENDING"
  | "PAID"
  | "CANCELED"
  | "EXPIRED"
  | "FAILED";

export type InitiationSlotTemplate = {
  startTime: "11:00" | "14:00";
  endTime: "12:00" | "15:00";
};

export type InitiationSlot = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  reservedSeats: number;
  remainingSeats: number;
};

export type InitiationReservation = {
  id: string;
  slotId: string;
  fullName: string;
  email: string;
  phone: string;
  participantsCount: number;
  mealOption: InitiationMealOption;
  pricePerPersonCents: number;
  totalPriceCents: number;
  status: InitiationReservationStatus;
  sumupCheckoutId: string | null;
  sumupTransactionId: string | null;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
};

