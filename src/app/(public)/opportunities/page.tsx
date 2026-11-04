import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** Old list URL: the list now lives on Explore. Keeps any filters in the link. */
export default async function Page({ searchParams }: PageProps) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    for (const v of Array.isArray(value) ? value : value ? [value] : []) query.append(key, v);
  }
  redirect(routes.explore.section("opportunities", query.toString()));
}
