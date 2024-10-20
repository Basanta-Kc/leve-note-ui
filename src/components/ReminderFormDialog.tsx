import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useMutation } from "@tanstack/react-query";
import { Note } from "@/shcemas";
import { createReminder, updateReminder } from "@/api";
import { useToast } from "@/hooks/use-toast";

const ReminderSchema = z.object({
  email: z.string().email("Invalid email format"),
  date: z.coerce.date(),
});

type ReminderFormInputs = z.infer<typeof ReminderSchema>;

/**
 * A dialog for setting a reminder for a note.
 *
 * The dialog allows the user to set an email reminder for the selected note.
 * The reminder is sent to the email address the user provides at the date and
 * time specified.
 *
 * The dialog takes the following props:
 * - `isReminderDialogOpen`: Whether the dialog is open.
 * - `setIsReminderDialogOpen`: A function to set whether the dialog is open.
 * - `selectedNote`: The selected note.
 *
 * @returns The reminder dialog component.
 */
export function ReminderFormDialog({
  isReminderDialogOpen,
  setIsReminderDialogOpen,
  selectedNote,
}: {
  selectedNote: Note | undefined;
  isReminderDialogOpen: boolean;
  setIsReminderDialogOpen: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ReminderFormInputs>({
    resolver: zodResolver(ReminderSchema),
  });

  const createReminderMutation = useMutation({
    mutationFn: createReminder,
    onSuccess: ({ message }) => {
      toast({
        description: message,
      });
    },
  });

  const updateReminderMutation = useMutation({
    mutationFn: updateReminder,
    onSuccess: ({ message }) => {
      toast({
        description: message,
      });
    },
  });

  const onSubmit = (data: ReminderFormInputs) => {
    if (selectedNote) {
      const reminderData = {
        email: data.email,
        date: data.date,
        note_id: selectedNote.id,
      };
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

  // Set default values when selectedNote changes
  useEffect(() => {
    if (selectedNote) {
      setValue("email", selectedNote.reminder?.email || "");
      setValue("date", selectedNote.reminder?.date || "");
    }
  }, [selectedNote, setValue]);

  return (
    <Dialog open={isReminderDialogOpen} onOpenChange={setIsReminderDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Reminder</DialogTitle>
          <DialogDescription>
            Set an email reminder for this note.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          {/* Email Field */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reminder-email" className="text-right">
              Email
            </Label>
            <div className="col-span-3">
              <Input
                id="reminder-email"
                {...register("email")}
                className="w-full"
                placeholder="Enter email"
              />
              {errors.email && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </span>
              )}
            </div>
          </div>

          {/* Date Field */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reminder-date" className="text-right">
              Date & Time
            </Label>
            <div className="col-span-3">
              <Input
                id="reminder-date"
                type="datetime-local"
                {...register("date")}
                className="w-full"
              />
              {errors.date && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.date.message}
                </span>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsReminderDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Set Reminder</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
