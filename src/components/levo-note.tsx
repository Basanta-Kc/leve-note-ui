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
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { z } from "zod";
import { useInView } from "react-intersection-observer";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import httpClient from "@/config/httpClient";
import useDebounce from "@/hooks/useDebounce";

// Zod schemas for data validation
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const NoteSchema = z.object({
  id: z.string(), // Changed to string as the response has IDs as strings
  title: z.string(),
  description: z.string(),
});

const ReminderSchema = z.object({
  id: z.string().optional(),
  email: z.string().email(),
  date: z.string(),
  note_id: z.string(),
});

type Note = z.infer<typeof NoteSchema>;
type Reminder = z.infer<typeof ReminderSchema>;

// API calls to handle notes and reminders
const api = {
  getNotes: async (
    page = 1,
    limit = 5,
    search = ""
  ): Promise<{ items: Note[]; total: number }> => {
    const response = await httpClient.get(
      `/notes?page=${page}&limit=${limit}&search=${search}`
    );
    return response.data; // Assuming data contains items and total fields
  },
  getNote: async (id: string): Promise<Note> => {
    const response = await httpClient.get(`/notes/${id}`);
    return response.data;
  },
  createNote: async (note: Omit<Note, "id">): Promise<Note> => {
    const response = await httpClient.post("/notes", note);
    return response.data;
  },
  updateNote: async ({ id, title, description }: Note): Promise<Note> => {
    const response = await httpClient.put(`/notes/${id}`, {
      title,
      description,
    });
    return response.data;
  },
  deleteNote: async (id: string): Promise<void> => {
    await httpClient.delete(`/notes/${id}`);
  },
  createReminder: async (reminder: Omit<Reminder, "id">): Promise<Reminder> => {
    const response = await httpClient.post("/reminders", reminder);
    return response.data;
  },
};

function LevoNote() {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [reminderEmail, setReminderEmail] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const { ref, inView } = useInView();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Debounced values
  const debouncedTitle = useDebounce(title, 2000); // 500ms debounce
  const debouncedDescription = useDebounce(description, 2000);

  // Debounced values
  const debouncedSearchQuery = useDebounce(searchQuery, 2000);

  // Infinite query for fetching notes
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading: isLoadingNotes,
  } = useInfiniteQuery({
    queryKey: ["notes", debouncedSearchQuery],
    queryFn: ({ pageParam = 1 }) =>
      api.getNotes(pageParam, 5, debouncedSearchQuery),
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = allPages.length + 1; // Increment current page count
      return nextPage <= lastPage.total / 5 ? nextPage : undefined; // Assuming `total` is the total number of notes
    },
  });

  const notes = data ? data.pages.flatMap((page) => page.items) : [];

  const {
    data: selectedNote,
    isLoading: isLoadingSelectedNote,
    isFetched,
  } = useQuery({
    queryKey: ["note", selectedNoteId],
    queryFn: () => api.getNote(selectedNoteId!),
    enabled: !!selectedNoteId,
  });

  useEffect(() => {
    if (isFetched) {
      setTitle(selectedNote?.title || "");
      setDescription(selectedNote?.description || "");
    }
  }, [isFetched, selectedNote]);

  const createNoteMutation = useMutation({
    mutationFn: api.createNote,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes"] }),
  });

  const updateNoteMutation = useMutation({
    mutationFn: api.updateNote,
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
    mutationFn: api.deleteNote,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes"] }),
  });

  const createReminderMutation = useMutation({
    mutationFn: api.createReminder,
  });

  const addNewNote = () => {
    createNoteMutation.mutate({
      title: `Untitled ${notes.length + 1}`,
      description: "<p>Start writing your new note by clicking on edit icon above ...</p>",
    });
  };

  const deleteNote = () => {
    if (selectedNote) {
      deleteNoteMutation.mutate(selectedNote.id);
      setSelectedNoteId(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const setReminder = () => {
    if (selectedNote) {
      const reminderData = ReminderSchema.parse({
        email: reminderEmail,
        date: reminderDate,
        note_id: selectedNote.id,
      });
      createReminderMutation.mutate(reminderData);
      setIsReminderDialogOpen(false);
      setReminderEmail("");
      setReminderDate("");
    }
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
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
              {/* {isFetchingNextPage ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Button onClick={() => fetchNextPage()} variant="ghost">
                  Load More
                </Button>
              )} */}
            </div>
          )}
        </nav>
      </div>

      {/* Main content */}
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
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleEditMode}
                className="p-2 hover:bg-gray-100 rounded"
              >
                {isEditing ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Edit className="w-5 h-5" />
                )}
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
          )}
        </div>

        {/* Note content */}
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
                dangerouslySetInnerHTML={{ __html: description}}
              />
            )
          ) : (
            <p className="text-gray-500">
              Select a note or create a new one to start writing.
            </p>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
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

      {/* Set Reminder Dialog */}
      <Dialog
        open={isReminderDialogOpen}
        onOpenChange={setIsReminderDialogOpen}
      >
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
                value={reminderEmail}
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
                value={reminderDate}
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
    </div>
  );
}

// Wrap the app with QueryClientProvider
export function LevoNoteComponent() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <LevoNote />
    </QueryClientProvider>
  );
}
