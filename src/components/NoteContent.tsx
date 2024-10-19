import {
  Loader2,
} from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Note } from "@/shcemas";

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
