import {
  Trash2,
  Clock,
  Edit,
  X,
} from "lucide-react";

/**
 * A component that displays the actions for a note.
 *
 * The component renders the actions at the bottom of the note content area.
 * The actions are:
 * - Toggle edit mode
 * - Set reminder
 * - Delete note
 *
 * @param isEditing - Whether the note is in edit mode.
 * @param toggleEditMode - A function to toggle whether the note is in edit mode.
 * @param setIsReminderDialogOpen - A function to set whether the reminder dialog is open.
 * @param setIsDeleteDialogOpen - A function to set whether the delete dialog is open.
 *
 * @returns The actions component.
 */
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
