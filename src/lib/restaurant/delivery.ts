/** An acknowledgement failure must not turn an already delivered request into a retry. */
export async function deliverRestaurantRequest(
  sendRequest: () => Promise<void>,
  sendAcknowledgement: () => Promise<void>,
): Promise<{ acknowledgementSent: boolean }> {
  await sendRequest();
  try {
    await sendAcknowledgement();
    return { acknowledgementSent: true };
  } catch {
    return { acknowledgementSent: false };
  }
}
