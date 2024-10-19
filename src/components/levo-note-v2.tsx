import { useState, useEffect } from "react";
import {
  PlusCircle,
  ChevronRight,
  Menu,
  Trash2,
  Clock,
  Search,
  Loader2,
  Edit,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import useDebounce from "@/hooks/useDebounce";
import { convertToDateTimeLocal } from "@/lib/utils";
import { Note, ReminderSchema } from "@/shcemas";
import {
  createNote,
  createReminder,
  getNote,
  deleteNote,
  getNotes,
  updateNote,
  updateReminder,
} from "@/api";

export function LevoNote() {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const { ref, inView } = useInView(); // used for infinite scroll
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Debounced values
  const debouncedTitle = useDebounce(title, 2000);
  const debouncedDescription = useDebounce(description, 2000);
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);

  // Infinite query for fetching notes
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading: isLoadingNotes,
  } = useInfiniteQuery({
    queryKey: ["notes", debouncedSearchQuery],
    queryFn: ({ pageParam = 1 }) =>
      getNotes(pageParam, 20, debouncedSearchQuery),
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = allPages.length + 1;
      return nextPage <= lastPage.total / 20 ? nextPage : undefined;
    },
  });

  const notes = data ? data.pages.flatMap((page) => page.items) : [];

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
  });

  // Effect to handle updates when debounced values change
  useEffect(() => {
    if (debouncedTitle || debouncedDescription) {
      updateNoteMutation.mutate({
        id: selectedNoteId,
        title: debouncedTitle,
        description: debouncedDescription,
      });
    }
  }, [debouncedTitle, debouncedDescription]);

  const deleteNoteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes"] }),
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

  // Automatically fetch next page when `inView` is true (bottom of the list is visible)
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <NoteSideBar
        isSidebarOpen={isSidebarOpen}
        selectedNoteId={selectedNoteId}
        setSelectedNoteId={setSelectedNoteId}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        notes={notes}
        hasNextPage={hasNextPage}
        ref={ref}
        isLoadingNotes={isLoadingNotes}
      />
      {/* Main content */}
      <MainContent
        description={description}
        isLoadingNotes={isLoadingNotes}
        isLoadingSelectedNote={isLoadingSelectedNote}
        selectedNote={selectedNote}
        isEditing={isEditing}
        toggleEditMode={toggleEditMode}
        setDescription={setDescription}
        title={title}
        setTitle={setTitle}
        setIsReminderDialogOpen={setIsReminderDialogOpen}
        isSidebarOpen={isSidebarOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        setIsSidebarOpen={setIsSidebarOpen}
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

export function NoteSideBar({
  isSidebarOpen,
  selectedNoteId,
  setSelectedNoteId,
  searchQuery,
  setSearchQuery,
  notes,
  hasNextPage,
  ref,
  isLoadingNotes,
}: {
  isSidebarOpen: boolean;
  selectedNoteId: string | null;
  setSelectedNoteId: React.Dispatch<React.SetStateAction<string | null>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  notes: Note[];
  hasNextPage: boolean;
  ref: (node?: Element | null) => void;
  isLoadingNotes: boolean;
}) {
  const queryClient = useQueryClient();

  const createNoteMutation = useMutation({
    mutationFn: createNote,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setSelectedNoteId(data.note.id);
    },
  });

  const addNewNote = () => {
    createNoteMutation.mutate({
      title: `Untitled`,
      description:
        "<p>Start writing your new note by clicking on edit icon above ...</p>",
    });
  };

  return (
    <div
      className={`bg-gray-100 ${
        isSidebarOpen ? "w-64" : "w-0"
      } transition-all duration-300 overflow-hidden flex flex-col`}
    >
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Levo Note</h1>
        <button
          onClick={addNewNote}
          className="flex items-center text-gray-700 hover:text-gray-900 mb-4"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          New Note
        </button>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto">
        {notes.map((note) => (
          <button
            key={note.id}
            onClick={() => setSelectedNoteId(note.id)}
            className={`w-full text-left p-2 hover:bg-gray-200 flex items-center ${
              selectedNoteId === note.id ? "bg-gray-200" : ""
            }`}
          >
            <ChevronRight className="w-4 h-4 mr-2" />
            {note.title}
          </button>
        ))}
        {hasNextPage && (
          <div ref={ref} className="flex justify-center p-4">
            {/* Loading spinner will appear automatically when fetching */}
            {isLoadingNotes && <Loader2 className="w-6 h-6 animate-spin" />}
          </div>
        )}
      </nav>
    </div>
  );
}

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

export function NoteActions({
  isEditing,
  toggleEditMode,
  setIsReminderDialogOpen,
  setIsDeleteDialogOpen,
}: {
  isEditing: boolean;
  toggleEditMode: () => void;
  setIsReminderDialogOpen: (open: boolean) => void;
  setIsDeleteDialogOpen: (open: boolean) => void;
}) {
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={toggleEditMode}
        className="p-2 hover:bg-gray-100 rounded"
      >
        {isEditing ? <X className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
      </button>
      <button
        onClick={() => setIsReminderDialogOpen(true)}
        className="p-2 hover:bg-gray-100 rounded"
      >
        <Clock className="w-5 h-5" />
      </button>
      <button
        onClick={() => setIsDeleteDialogOpen(true)}
        className="p-2 hover:bg-gray-100 rounded"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
}

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

export function ReminderFormDialog({
  isReminderDialogOpen,
  setIsReminderDialogOpen,
  selectedNote,
}: {
  selectedNote: Note | undefined;
  isReminderDialogOpen: boolean;
  setIsReminderDialogOpen: (open: boolean) => void;
}) {
  console.log(selectedNote);
  const [reminderEmail, setReminderEmail] = useState();
  const [reminderDate, setReminderDate] = useState();
  const createReminderMutation = useMutation({
    mutationFn: createReminder,
  });

  const updateReminderMutation = useMutation({
    mutationFn: updateReminder,
  });
  const setReminder = () => {
    if (selectedNote) {
      const reminderData = ReminderSchema.parse({
        email: reminderEmail,
        date: reminderDate,
        note_id: selectedNote.id,
      });
      if (selectedNote.reminder) {
        updateReminderMutation.mutate({
          id: selectedNote.reminder.id,
          ...reminderData,
        });
      } else {
        createReminderMutation.mutate(reminderData);
      }
      setIsReminderDialogOpen(false);
    }
  };
  return (
    <Dialog open={isReminderDialogOpen} onOpenChange={setIsReminderDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Reminder</DialogTitle>
          <DialogDescription>
            Set an email reminder for this note.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reminder-email" className="text-right">
              Email
            </Label>
            <Input
              id="reminder-email"
              value={reminderEmail ?? selectedNote?.reminder?.email ?? ""}
              onChange={(e) => setReminderEmail(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reminder-date" className="text-right">
              Date & Time
            </Label>
            <Input
              id="reminder-date"
              type="datetime-local"
              value={
                reminderDate ??
                (selectedNote?.reminder?.date
                  ? convertToDateTimeLocal(selectedNote?.reminder?.date)
                  : "")
              }
              onChange={(e) => setReminderDate(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsReminderDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button onClick={setReminder}>Set Reminder</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteDialog({
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  deleteNote,
}: {
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  deleteNote: () => void;
}) {
  return (
    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Note</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this note? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsDeleteDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button variant="destructive" onClick={deleteNote}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Wrap the app with QueryClientProvider

