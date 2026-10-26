import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

/** The landing page is designed in a later module. Until then the home page opens Opportunities. */
export default function HomePage() {
  redirect(routes.opportunities.list);
}
