import "react-quill/dist/quill.snow.css";
import { Menu } from "lucide-react";
import { NoteActions } from "./NoteActions";
import { NoteContent } from "./NoteContent";
import { updateNote, deleteNote, getNote } from "@/api";
import useDebounce from "@/hooks/useDebounce";
import useSyncQueryParam from "@/hooks/useSyncQueryParam";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { DeleteDialog } from "./DeleteDialog";
import { ReminderFormDialog } from "./ReminderFormDialog";
import { useToast } from "@/hooks/use-toast";

/**
 * MainContent component for displaying the main content area of the note-taking app.
 *
 * This component handles the rendering of the main content section, including the note title, description, editing mode, and actions.
 *
 * Props:
 * - selectedNoteId: The ID of the selected note.
 * - setSelectedNoteId: Function to set the selected note ID.
 * - isLoadingNotes: Indicates if notes are currently loading.
 * - setIsSidebarOpen: Function to set the sidebar open state.
 * - isSidebarOpen: Indicates if the sidebar is open.
 */

export function MainContent({
  selectedNoteId,
  setSelectedNoteId,
  isLoadingNotes,
  setIsSidebarOpen,
  isSidebarOpen,
}: {
  selectedNoteId: string | null;
  setSelectedNoteId: (noteId: string | null) => void;
  isLoadingNotes: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isSidebarOpen: boolean;
}) {
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useSyncQueryParam("noteId", setSelectedNoteId);

  // Debounced values
  const debouncedTitle = useDebounce(title);
  const debouncedDescription = useDebounce(description);
  const {
    data: selectedNote,
    isLoading: isLoadingSelectedNote,
    isFetched,
  } = useQuery({
    queryKey: ["note", selectedNoteId],
    queryFn: () => getNote(selectedNoteId!),
    enabled: !!selectedNoteId,
  });
  useEffect(() => {
    if (isFetched) {
      setTitle(selectedNote?.title ?? "");
      setDescription(selectedNote?.description ?? "");
    }
  }, [isFetched, selectedNote]);

  const updateNoteMutation = useMutation({
    mutationFn: updateNote,
    retry: 0,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  // Effect to handle updates when debounced values change
  useEffect(() => {
    if ((debouncedTitle || debouncedDescription) && isEditing) {
      updateNoteMutation.mutate({
        id: selectedNoteId,
        title: debouncedTitle,
        description: debouncedDescription,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTitle, debouncedDescription, isEditing]);

  const deleteNoteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast({
        description: message,
      });
    },
  });

  const handleDeleteNote = () => {
    if (selectedNote) {
      deleteNoteMutation.mutate(selectedNote.id);
      setSelectedNoteId(null);
      setTitle("");
      setDescription("");
      setIsDeleteDialogOpen(false);
    }
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

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
      {/* Delete Note Dialog */}
      <DeleteDialog
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        deleteNote={handleDeleteNote}
      />

      {/* Set Reminder Dialog */}
      <ReminderFormDialog
        isReminderDialogOpen={isReminderDialogOpen}
        setIsReminderDialogOpen={setIsReminderDialogOpen}
        selectedNote={selectedNote}
      />
    </div>
  );
}
