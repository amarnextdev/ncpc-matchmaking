/**
 * Open the messaging dock from anywhere (header icon, "Message" buttons):
 *   openDock()            → the conversation list
 *   openDock(conversationId) → that chat
 * Links can do the same with ?chat=<conversationId> (see routes.workspace.chat).
 */
export const DOCK_EVENT = "ncpc:dock";

export function openDock(conversationId?: string) {
  window.dispatchEvent(new CustomEvent(DOCK_EVENT, { detail: { chat: conversationId ?? null } }));
}
