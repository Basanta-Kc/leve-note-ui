import { useState } from "react";
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
  useMutation,
} from "@tanstack/react-query";
import "react-quill/dist/quill.snow.css";
import { convertToDateTimeLocal } from "@/lib/utils";
import { Note, ReminderSchema } from "@/shcemas";
import {
  createReminder,
  updateReminder,
} from "@/api";


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
