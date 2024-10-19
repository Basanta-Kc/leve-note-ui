import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const convertToDateTimeLocal = (dateString: string) => {
  const date = new Date(dateString);
  const isoString = date.toISOString(); // e.g., 2024-10-19T13:50:00.000Z
  return isoString.slice(0, 16); // Returns in YYYY-MM-DDTHH:mm format
};
