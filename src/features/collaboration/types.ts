import type { LookingFor, OrganisationCategory } from "@/lib/constants";
import type { DealStage } from "./constants";

/** One side of a conversation (an organisation). */
export type Party = {
  /** Database organisations only (used to place live messages) */
  orgId?: string;
  slug: string;
  name: string;
  initials: string;
  tint: string;
  category: OrganisationCategory;
  location: string;
  verified: boolean;
  contact: { name: string; role: string; email: string; phone: string };
};

export type FileRef = { name: string; size: string; type: "pdf" | "xlsx" | "doc" };

export type SharedProject = {
  title: string;
  slug: string | null;
  eyebrow: string;
  meta: string;
  tint: string;
  /** Deal id that opens when the partner presses "Start a deal". */
  dealId: string;
};

export type Message =
  | { id: string; kind: "divider"; text: string }
  | {
      id: string;
      kind: "event";
      icon: "link" | "calendar" | "check";
      tone: "green" | "blue";
      title: string;
      text: string;
    }
  | {
      id: string;
      kind: "post";
      from: string;
      person: string;
      time: string;
      text: string;
      /** Only for my own messages: Sending… → Sent → Seen (the other side opened the chat). */
      status?: "sending" | "sent" | "seen";
      files?: FileRef[];
      project?: SharedProject;
    };

export type DealDocument = {
  name: string;
  meta: string;
  status: "requested" | "uploaded" | "reviewed";
};

export type Meeting = {
  title: string;
  month: string;
  day: string;
  when: string;
  status: "proposed" | "confirmed" | "done";
};

/** Database state of a deal (real organisations only). */
export type DealLive = {
  enquiryId: string;
  /** null until someone presses "Start deal" */
  dealId: string | null;
  projectId: string | null;
  isOwner: boolean;
  myNote: string;
  request: {
    id: string;
    status: "requested" | "submitted" | "changes_requested" | "accepted" | "withdrawn";
    ownerNote: string | null;
    version: number;
    form: Record<string, string | string[]> | null;
    submittedAt: string | null;
  } | null;
  partnership: {
    id: string;
    status: "awaiting_confirmation" | "active" | "ended";
    amount: number | null;
    amountPublic: boolean;
    ownerConfirmedAt: string | null;
    partnerConfirmedAt: string | null;
  } | null;
};

/** One project discussed inside a conversation. */
export type Deal = {
  id: string;
  projectTitle: string;
  projectSlug: string | null;
  ownerSlug: string;
  partnerSlug: string;
  role: LookingFor;
  stage: DealStage | "not_started";
  documents: DealDocument[];
  meetings: Meeting[];
  terms: { label: string; value: string }[];
  termsNote: string;
  /** Private notes per organisation slug. */
  notes: Record<string, string>;
  /** Set for database deals: the collaboration flow runs on this. */
  live?: DealLive;
};

/** One chat between two organisations (they are connected). */
export type Conversation = {
  id: string;
  parties: [Party, Party];
  lastAt: string;
  unread: Record<string, number>;
  messages: Message[];
  deals: Deal[];
};

/** A conversation as one viewer sees it. */
export type ConversationView = {
  id: string;
  me: Party;
  them: Party;
  lastAt: string;
  unread: number;
  preview: string;
  /** "Solar Rooftop · Due diligence" */
  tag: string;
  tagStage: DealStage | "not_started";
  messages: Message[];
  deals: Deal[];
};

/** An enquiry the viewer received and has not answered yet. */
export type EnquiryRequest = {
  id: string;
  from: Party;
  project: string;
  role: LookingFor;
  note: string;
  sentAgo: string;
  match: number;
};

/** What the Send enquiry dialog needs to know about the target. */
export type EnquiryTarget = {
  org: {
    slug: string;
    name: string;
    initials: string;
    tint: string;
    meta: string;
    verified: boolean;
    logoUrl?: string | null;
    /** Needed for enquiries from an organisation profile (which roles they can take). */
    category?: OrganisationCategory;
  };
  /** From a project page: the project is fixed and roles come from its "Looking for". */
  project?: {
    title: string;
    slug: string;
    meta: string;
    tint: string;
    coverUrl?: string | null;
    lookingFor: LookingFor[];
  };
  match?: { score: number; reasons: string[] };
  /** Already connected: show "Message" instead of "Send enquiry". */
  connectedHref?: string;
};
