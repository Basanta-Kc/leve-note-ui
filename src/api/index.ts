import httpClient from "@/config/httpClient";
import { Note, Reminder } from "@/shcemas";

type Response = {
  message: string;
};

// Function to get notes with pagination and search
export async function getNotes(
  page = 1,
  limit = 5,
  search = ""
): Promise<{ items: Note[]; total: number }> {
  const response = await httpClient.get(
    `/notes?page=${page}&limit=${limit}&search_query=${search}`
  );
  return response.data; // Assuming data contains items and total fields
}

// Function to get a single note by ID
export async function getNote(id: string): Promise<Note> {
  const response = await httpClient.get(`/notes/${id}`);
  return response.data;
}

// Function to create a new note
export async function createNote(note: Omit<Note, "id">): Promise<Note> {
  const response = await httpClient.post("/notes", note);
  return response.data;
}

// Function to update an existing note
export async function updateNote({
  id,
  title,
  description,
}: Note): Promise<Note> {
  const response = await httpClient.put(`/notes/${id}`, {
    title,
    description,
  });
  return response.data;
}


// Function to delete a note by ID
export async function deleteNote(id: string): Promise<Response> {
  const response = await httpClient.delete(`/notes/${id}`);
  return response.data;
}

// Function to create a new reminder
export async function createReminder(
  reminder: Omit<Reminder, "id">
): Promise<Response> {
  const response = await httpClient.post("/reminders", reminder);
  return response.data;
}

// Function to update an existing reminder
export async function updateReminder(reminder: Reminder): Promise<Response> {
  const response = await httpClient.put(`/reminders/${reminder.id}`, {
    email: reminder.email,
    date: reminder.date,
  });
  return response.data;
}
