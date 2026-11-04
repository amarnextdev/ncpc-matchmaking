"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { respondEnquiryAction, withdrawEnquiryAction } from "@/features/collaboration/actions";
import { openDock } from "@/features/collaboration/dock-events";

/** Ignore · Accept for a received invitation. Accepting opens the new chat in the dock. */
export function InvitationActions({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const answer = (decision: "accept" | "decline") =>
    start(async () => {
      const r = await respondEnquiryAction({ enquiryId: id, decision });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success(
        decision === "accept" ? `You are now connected with ${name}` : "Invitation ignored",
      );
      router.refresh();
      if (decision === "accept" && r.conversationId) {
        const cid = r.conversationId;
        setTimeout(() => openDock(cid), 600);
      }
    });
  return (
    <div className="flex shrink-0 items-center gap-2">
      <Button
        variant="ghost"
        className="h-[38px] px-4 text-foreground/70"
        disabled={pending}
        onClick={() => answer("decline")}
      >
        Ignore
      </Button>
      <Button
        variant="outline-primary"
        className="h-[38px] border-[1.5px] px-5 font-bold"
        disabled={pending}
        onClick={() => answer("accept")}
      >
        {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
        Accept
      </Button>
    </div>
  );
}

export function WithdrawButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      variant="outline"
      size="sm"
      className="h-9 px-3.5"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const r = await withdrawEnquiryAction(id);
          if (!r.ok) toast.error(r.error ?? "We could not withdraw it.");
          else {
            toast.success("Invitation withdrawn");
            router.refresh();
          }
        })
      }
    >
      {pending ? <Loader2 className="animate-spin" aria-hidden /> : null} Withdraw
    </Button>
  );
}
