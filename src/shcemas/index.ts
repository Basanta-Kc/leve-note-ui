// Zod schemas for data validation
import { z } from "zod";

export const NoteSchema = z.object({
  id: z.string(), 
  title: z.string(),
  description: z.string(),
});

export const ReminderSchema = z.object({
  id: z.string().optional(),
  email: z.string().email(),
  date: z.string(),
  note_id: z.string(),
});

export type Note = z.infer<typeof NoteSchema>;
export type Reminder = z.infer<typeof ReminderSchema>;
