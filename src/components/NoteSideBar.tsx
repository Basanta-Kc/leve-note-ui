import { PlusCircle, ChevronRight, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FetchNextPageOptions, InfiniteData, InfiniteQueryObserverResult, useMutation, useQueryClient } from "@tanstack/react-query";
import "react-quill/dist/quill.snow.css";
import { Note } from "@/shcemas";
import { createNote } from "@/api";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

/**
 * A sidebar for listing notes and creating a new note.
 *
 * @param isSidebarOpen - Whether the sidebar is open.
 * @param selectedNoteId - The ID of the selected note.
 * @param setSelectedNoteId - A function to set the selected note ID.
 * @param searchQuery - The search query string.
 * @param setSearchQuery - A function to set the search query string.
 * @param notes - The list of notes.
 * @param hasNextPage - Whether there is a next page.
 * @param isLoadingNotes - Whether the notes are loading.
 * @param setIsEditing - A function to set whether the note is being edited.
 * @param fetchNextPage - A function to fetch the next page of notes.
 */
export function NoteSideBar({
  isSidebarOpen,
  selectedNoteId,
  setSelectedNoteId,
  searchQuery,
  setSearchQuery,
  notes,
  hasNextPage,
  isLoadingNotes,
  fetchNextPage,
}: {
  isSidebarOpen: boolean;
  selectedNoteId: string | null;
  setSelectedNoteId: React.Dispatch<React.SetStateAction<string | null>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  notes: Note[];
  hasNextPage: boolean;
  isLoadingNotes: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  fetchNextPage: (
    options?: FetchNextPageOptions
  ) => Promise<
    InfiniteQueryObserverResult<InfiniteData<unknown, unknown>, Error>
  >;
}) {
  const queryClient = useQueryClient();

  const { ref, inView } = useInView();
  // Automatically fetch next page when `inView` is true (bottom of the list is visible)
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

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
