import { useState } from "react";
import {
  useInfiniteQuery,
} from "@tanstack/react-query";
import "react-quill/dist/quill.snow.css";
import useDebounce from "@/hooks/useDebounce";
import { getNotes } from "@/api";
import { MainContent } from "./MainContent";
import { NoteSideBar } from "./NoteSideBar";
import useSyncQueryParam from "@/hooks/useSyncQueryParam";

/**
 * A note-taking app with a sidebar for listing notes and a main content area for editing a selected note.
 * The app uses React Query for caching and optimistic updates.
 *
 * The app has the following features:
 * - Creates a new note with a title and description
 * - Edits a selected note
 * - Deletes a selected note
 * - Sets a reminder for a selected note
 * - Lists all notes and filters by search query
 * - Paginates notes 20 at a time
 * - Debounces search query and updates notes list
 * - Debounces title and description and updates the selected note
 * - Invalidates the notes list when a note is edited or deleted
 *
 * The app uses the following hooks:
 * - useQuery for fetching notes and selected note
 * - useMutation for updating a note and deleting a note
 * - useInfiniteQuery for paginating notes
 * - useDebounce for debouncing search query and title and description
 * - useSyncQueryParam for syncing the selected note ID with the URL query parameter
 *
 * The app uses the following APIs:
 * - getNotes(page, limit, searchQuery) for fetching notes
 * - getNote(id) for fetching a selected note
 * - updateNote(id, title, description) for updating a note
 * - deleteNote(id) for deleting a note
 */

export function LevoNote() {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");

  useSyncQueryParam("noteId", setSelectedNoteId);

  // Debounced values
  const debouncedSearchQuery = useDebounce(searchQuery);

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
        isLoadingNotes={isLoadingNotes}
        fetchNextPage={fetchNextPage}
      />
      {/* Main content */}
      <MainContent
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isLoadingNotes={isLoadingNotes}
        selectedNoteId={selectedNoteId}
        setSelectedNoteId={setSelectedNoteId}
      />
    </div>
  );
}
