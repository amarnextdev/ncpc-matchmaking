import { DEAL_STAGES } from "./constants";
import type { Conversation, ConversationView, Deal } from "./types";

const stageLabel = (deal: Deal) =>
  deal.stage === "not_started"
    ? "Not started"
    : (DEAL_STAGES.find((s) => s.value === deal.stage)?.label ?? deal.stage);

export const dealStageLabel = stageLabel;

/** Short project name for list tags: text before the first "&" or ",". */
const shortTitle = (title: string) => title.split(/\s[&,]\s|,\s/)[0] ?? title;

/** A conversation from one organisation's point of view. */
export function toView(c: Conversation, mySlug: string): ConversationView | null {
  const me = c.parties.find((p) => p.slug === mySlug);
  const them = c.parties.find((p) => p.slug !== mySlug);
  if (!me || !them) return null;
  const lastPost = [...c.messages].reverse().find((m) => m.kind === "post");
  const preview = lastPost
    ? `${lastPost.from === mySlug ? "You: " : ""}${lastPost.text}`
    : "No messages yet";
  const main = c.deals.find((d) => d.stage !== "not_started") ?? c.deals[0];
  return {
    id: c.id,
    me,
    them,
    lastAt: c.lastAt,
    unread: c.unread[mySlug] ?? 0,
    preview,
    tag: main ? `${shortTitle(main.projectTitle)} · ${stageLabel(main)}` : "",
    tagStage: main?.stage ?? "not_started",
    messages: c.messages,
    deals: c.deals,
    addable: c.addable ?? [],
  };
}
