import {
  Loader2,
} from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Note } from "@/shcemas";

/**
 * The main content of the note-taking app.
 *
 * This component renders the main content area of the note-taking app, which
 * displays a note or allows the user to create a new note.
 *
 * The component takes the following props:
 * - `description`: The description of the selected note.
 * - `isLoadingNotes`: Whether the notes are being fetched.
 * - `isLoadingSelectedNote`: Whether the selected note is being fetched.
 * - `selectedNote`: The selected note, if any.
 * - `isEditing`: Whether the selected note is being edited.
 * - `setDescription`: A function to set the description of the selected note.
 *
 * @returns The main content component.
 */
export function NoteContent({
  description,
  isLoadingNotes,
  isLoadingSelectedNote,
  selectedNote,
  isEditing,
  setDescription,
}: {
  description: string;
  isLoadingNotes: boolean;
  isLoadingSelectedNote: boolean;
  selectedNote: Note | undefined;
  isEditing: boolean;
  setDescription: (description: string) => void;
}) {
  return (
    <div className="flex-1 p-8 overflow-auto">
      {isLoadingNotes || isLoadingSelectedNote ? (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : selectedNote ? (
        isEditing ? (
          <ReactQuill
            value={description}
            
            onChange={(content) => setDescription(content)}
            className="h-full"
          />
        ) : (
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )
      ) : (
        <p className="text-gray-500">
          Select a note or create a new one to start writing.
        </p>
      )}
    </div>
  );
}
