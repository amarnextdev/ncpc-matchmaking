/**
 * Open the messaging dock from anywhere (header icon, "Message" buttons):
 *   openDock()            → the conversation list
 *   openDock(conversationId) → that chat
 * Links can do the same with ?chat=<conversationId> (see routes.workspace.chat).
 */
export const DOCK_EVENT = "ncpc:dock";

export function openDock(conversationId?: string, opts?: { deal?: boolean }) {
  window.dispatchEvent(
    new CustomEvent(DOCK_EVENT, {
      detail: { chat: conversationId ?? null, deal: Boolean(opts?.deal) },
    }),
  );
}

/**
 * A ?chat= link to the page we are already on would not reload the dock, so open it directly.
 * Returns true when it did (the caller then skips navigation).
 */
export function openDockFromLink(link: string): boolean {
  const url = new URL(link, window.location.origin);
  const chat = url.searchParams.get("chat");
  if (!chat || url.pathname !== window.location.pathname) return false;
  openDock(chat, { deal: url.searchParams.has("deal") });
  return true;
}
