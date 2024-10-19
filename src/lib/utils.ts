import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class values to generate a single merged class string.
 * 
 * @param inputs - The class values to be merged.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
/**
 * Converts a given date string to the DateTime-Local format
 * (YYYY-MM-DDTHH:mm), which is the expected format for the
 * HTML <input type="datetime-local"> element.
 *
 * @param dateString - The date string to convert. Can be in any
 * format that can be parsed by the JavaScript Date
 * constructor.
 * @returns The converted date string in the DateTime-Local
 * format.
 */
export const convertToDateTimeLocal = (dateString: string) => {
  const date = new Date(dateString);
  const isoString = date.toISOString(); // e.g., 2024-10-19T13:50:00.000Z
  return isoString.slice(0, 16); // Returns in YYYY-MM-DDTHH:mm format
};
/**
 * Converts a given date string to the UTC timezone and returns
 * it as an ISO string.
 * 
 * @param dateString - The date string to convert. Can be in any
 * format that can be parsed by the JavaScript Date
 * constructor.
 * @returns The converted date string in the ISO format.
 */
export function convertToUtc(dateString: string) {
  // Create a Date object from the input string
  const localDate = new Date(dateString);

  // Get the UTC time
  const utcDate = new Date(
    localDate.getTime() + localDate.getTimezoneOffset() * 60000
  );

  // Format the UTC date to ISO string format
  return utcDate.toISOString();
}


