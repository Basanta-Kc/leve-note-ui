import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import "react-quill/dist/quill.snow.css";

/**
 * A dialog for deleting a note.
 *
 * @param isDeleteDialogOpen - Whether the dialog is open.
 * @param setIsDeleteDialogOpen - A function to set whether the dialog is open.
 * @param deleteNote - A function to delete the note.
 *
 * @returns The dialog component.
 */
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
