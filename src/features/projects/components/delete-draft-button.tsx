"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { deleteProjectDraftAction } from "../actions";

export function DeleteDraftButton({ draftId, title }: { draftId: string; title: string }) {
  const router = useRouter();
  const [pending, start] = React.useTransition();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-[38px] px-[18px]">
          <Trash2 aria-hidden /> Delete draft
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this draft?</AlertDialogTitle>
          <AlertDialogDescription>
            &ldquo;{title}&rdquo; and everything you filled in will be removed. This can&apos;t be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            className={cn(buttonVariants({ variant: "destructive" }))}
            onClick={(e) => {
              e.preventDefault();
              start(async () => {
                const result = await deleteProjectDraftAction(draftId);
                if (result.ok) {
                  toast.success("Draft deleted.");
                  router.refresh();
                } else toast.error(result.error);
              });
            }}
          >
            {pending ? <Loader2 className="animate-spin" aria-hidden /> : null} Delete draft
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
