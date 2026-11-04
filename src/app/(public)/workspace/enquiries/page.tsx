import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

/** Enquiries are invitations on the Network page now. */
export default function Page() {
  redirect(routes.workspace.network);
}
