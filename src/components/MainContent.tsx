import "react-quill/dist/quill.snow.css";
import { Note } from "@/shcemas";
import { Menu } from "lucide-react";
import { NoteActions } from "./NoteActions";
import { NoteContent } from "./NoteContent";

export function MainContent({
  description,
  isLoadingNotes,
  isLoadingSelectedNote,
  selectedNote,
  isEditing,
  toggleEditMode,
  setDescription,
  title,
  setTitle,
  setIsReminderDialogOpen,
  isSidebarOpen,
  setIsDeleteDialogOpen,
  setIsSidebarOpen,
}: {
  description: string;
  isLoadingNotes: boolean;
  isLoadingSelectedNote: boolean;
  selectedNote: Note | undefined;
  isEditing: boolean;
  toggleEditMode: () => void;
  setDescription: (description: string) => void;
  title: string;
  setTitle: (title: string) => void;
  setIsReminderDialogOpen: (open: boolean) => void;
  setIsDeleteDialogOpen: (open: boolean) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}) {
  return (
    <div className="flex-1 flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b p-4 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="mr-4"
          >
            <Menu className="w-6 h-6" />
          </button>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-semibold bg-transparent border-none focus:outline-none"
          />
        </div>
        {selectedNote && (
          <NoteActions
            isEditing={isEditing}
            toggleEditMode={toggleEditMode}
            setIsReminderDialogOpen={setIsReminderDialogOpen}
            setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          />
        )}
      </div>
      <NoteContent
        description={description}
        isLoadingNotes={isLoadingNotes}
        isLoadingSelectedNote={isLoadingSelectedNote}
        selectedNote={selectedNote}
        isEditing={isEditing}
        setDescription={setDescription}
      />
    </div>
  );
}
