const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

function parseTimeToMinutes(time: string): number {
  if (!TIME_PATTERN.test(time)) {
    throw new Error(`Invalid time format: ${time}`);
  }

  const [hoursRaw, minutesRaw] = time.split(":");
  const hours = Number.parseInt(hoursRaw, 10);
  const minutes = Number.parseInt(minutesRaw, 10);

  return hours * 60 + minutes;
}

function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

export function generateTimeSlots(
  start = "12:00",
  end = "14:30",
  stepMin = 30
): string[] {
  if (!Number.isInteger(stepMin) || stepMin <= 0) {
    throw new Error("stepMin must be a positive integer.");
  }

  const startMinutes = parseTimeToMinutes(start);
  const endMinutes = parseTimeToMinutes(end);

  if (endMinutes < startMinutes) {
    throw new Error("end must be greater than or equal to start.");
  }

  const slots: string[] = [];

  for (let value = startMinutes; value <= endMinutes; value += stepMin) {
    slots.push(formatMinutes(value));
  }

  return slots;
}
