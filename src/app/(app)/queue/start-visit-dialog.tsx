"use client";

import { useActionState } from "react";
import { Loader2, ClipboardPlus } from "lucide-react";
import { createVisit, type VisitFormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function StartVisitDialog({
  patientId,
  patientName,
}: {
  patientId: string;
  patientName: string;
}) {
  const [state, formAction, isPending] = useActionState<
    VisitFormState,
    FormData
  >(createVisit, undefined);

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button>
            <ClipboardPlus className="h-4 w-4" /> Start visit
          </Button>
        }
      />
      <DialogContent>
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>Start a new visit</DialogTitle>
            <DialogDescription>
              Add {patientName} to the doctor&apos;s queue.
            </DialogDescription>
          </DialogHeader>

          <input type="hidden" name="patientId" value={patientId} />
          <div className="py-4">
            <Label htmlFor="chiefComplaint">Reason for visit *</Label>
            <Textarea
              id="chiefComplaint"
              name="chiefComplaint"
              placeholder="e.g. Fever and headache for 3 days"
              className="mt-1.5"
              rows={3}
              required
            />
            {state?.message && (
              <p className="text-destructive mt-1 text-xs">{state.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Add to queue
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
