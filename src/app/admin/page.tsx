import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

/** The admin dashboard comes later (Module 14); for now NCPC starts on Approvals. */
export default function Page() {
  redirect(routes.admin.approvals);
}
