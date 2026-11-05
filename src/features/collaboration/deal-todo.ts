import type { DealLive } from "./types";

export type DealTodo = { title: string; text: string; cta: string };

/**
 * What the viewer has to do next in a live deal, or null when it is the other side's turn.
 * Shown as a banner on top of the chat so nobody has to hunt for the Deal panel.
 */
export function dealTodo(live: DealLive | undefined, them: string): DealTodo | null {
  if (!live?.dealId) return null;
  const { request: req, partnership: part, isOwner } = live;

  if (part) {
    if (part.status !== "awaiting_confirmation") return null;
    const mine = isOwner ? part.ownerConfirmedAt : part.partnerConfirmedAt;
    if (mine) return null;
    return {
      title: "Confirm the partnership",
      text: "The offer is accepted. Once your agreement is signed, confirm it here.",
      cta: "Confirm",
    };
  }
  if (!req || req.status === "withdrawn") {
    return isOwner
      ? {
          title: `Ask ${them} for an offer`,
          text: "Send a collaboration request so they can tell you what they bring.",
          cta: "Send request",
        }
      : null;
  }
  if (!isOwner && req.status === "requested") {
    return {
      title: `${them} sent you a collaboration request`,
      text: "Fill in your offer: what you bring, the amount and the terms.",
      cta: "Fill in your offer",
    };
  }
  if (!isOwner && req.status === "changes_requested") {
    return {
      title: `${them} asked for changes`,
      text: req.ownerNote ?? "Update your offer and send it again.",
      cta: "Update offer",
    };
  }
  if (isOwner && req.status === "submitted") {
    return {
      title: `${them} sent their offer`,
      text: "Review it, then accept or ask for changes.",
      cta: "Review offer",
    };
  }
  return null;
}
