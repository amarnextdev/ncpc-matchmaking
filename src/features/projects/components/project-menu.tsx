"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { deleteProjectDraftAction } from "../actions";

type ProjectMenuProps = {
  title: string;
  editHref: string | null;
  publicHref: string | null;
  /** Set for drafts: shows "Delete draft" */
  draftId: string | null;
};

/** The ⋯ menu on a My projects card. Deleting a draft asks first. */
export function ProjectMenu({ title, editHref, publicHref, draftId }: ProjectMenuProps) {
  const router = useRouter();
  const [confirm, setConfirm] = React.useState(false);
  const [pending, start] = React.useTransition();
  if (!editHref && !publicHref && !draftId) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`More actions for ${title}`}
          className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none data-[state=open]:bg-muted"
        >
          <MoreHorizontal className="size-4" aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          {editHref ? (
            <DropdownMenuItem asChild>
              <Link href={editHref}>
                <Pencil aria-hidden /> {draftId ? "Continue editing" : "Edit project"}
              </Link>
            </DropdownMenuItem>
          ) : null}
          {publicHref ? (
            <DropdownMenuItem asChild>
              <Link href={publicHref}>
                <ExternalLink aria-hidden /> View public page
              </Link>
            </DropdownMenuItem>
          ) : null}
          {draftId ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => setConfirm(true)}>
                <Trash2 aria-hidden /> Delete draft
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      {draftId ? (
        <AlertDialog open={confirm} onOpenChange={setConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this draft?</AlertDialogTitle>
              <AlertDialogDescription>
                &ldquo;{title}&rdquo; and everything you filled in will be removed. This can&apos;t
                be undone.
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
                      setConfirm(false);
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
      ) : null}
    </>
  );
}
