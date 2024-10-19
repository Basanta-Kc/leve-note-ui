// Convert to the required format for datetime-local input
export const convertToDateTimeLocal = (dateString: string) => {
  const date = new Date(dateString);
  const isoString = date.toISOString(); // e.g., 2024-10-19T13:50:00.000Z
  return isoString.slice(0, 16); // Returns in YYYY-MM-DDTHH:mm format
};
