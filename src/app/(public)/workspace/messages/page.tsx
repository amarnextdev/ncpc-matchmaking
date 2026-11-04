import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

type PageProps = { searchParams: Promise<{ c?: string }> };

/** Chats live in the messaging dock now; old links open the chat there. */
export default async function Page({ searchParams }: PageProps) {
  const { c } = await searchParams;
  redirect(c ? routes.workspace.chat(c) : `${routes.workspace.network}?tab=connections`);
}
