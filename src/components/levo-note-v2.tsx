import { useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import "react-quill/dist/quill.snow.css";
import useDebounce from "@/hooks/useDebounce";
import { getNote, deleteNote, getNotes, updateNote } from "@/api";
import { DeleteDialog } from "./DeleteDialog";
import { MainContent } from "./MainContent";
import { NoteSideBar } from "./NoteSideBar";
import { ReminderFormDialog } from "./ReminderFormDialog";
import useSyncQueryParam from "@/hooks/useSyncQueryParam";

export function LevoNote() {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useSyncQueryParam("noteId", setSelectedNoteId);

  // Debounced values
  const debouncedTitle = useDebounce(title);
  const debouncedDescription = useDebounce(description);
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

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <NoteSideBar
        isSidebarOpen={isSidebarOpen}
        selectedNoteId={selectedNoteId}
        setSelectedNoteId={setSelectedNoteId}
        setIsEditing={setIsEditing}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        notes={notes}
        hasNextPage={hasNextPage}
        isLoadingNotes={isLoadingNotes}
        fetchNextPage={fetchNextPage}
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
