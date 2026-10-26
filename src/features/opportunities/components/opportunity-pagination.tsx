import { Pagination } from "@/components/shared/pagination";
import { routes } from "@/config/routes";
import { OPPORTUNITY_PARAMS } from "../search-params";
import type { OpportunityFilters } from "../types";

/** Link to the same filtered list on another page. */
function pageHref(f: OpportunityFilters, page: number) {
  const p = new URLSearchParams();
  if (f.q) p.set(OPPORTUNITY_PARAMS.q, f.q);
  if (f.themes.length) p.set(OPPORTUNITY_PARAMS.theme, f.themes.join(","));
  if (f.stages.length) p.set(OPPORTUNITY_PARAMS.stage, f.stages.join(","));
  if (f.lookingFor.length) p.set(OPPORTUNITY_PARAMS.lookingFor, f.lookingFor.join(","));
  if (f.province) p.set(OPPORTUNITY_PARAMS.province, f.province);
  if (f.capital) p.set(OPPORTUNITY_PARAMS.capital, f.capital);
  if (f.sort !== "newest") p.set(OPPORTUNITY_PARAMS.sort, f.sort);
  if (page > 1) p.set(OPPORTUNITY_PARAMS.page, String(page));
  const query = p.toString();
  return query ? `${routes.opportunities.list}?${query}` : routes.opportunities.list;
}

type Props = {
  filters: OpportunityFilters;
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
};

export function OpportunityPagination({ filters, ...rest }: Props) {
  return <Pagination {...rest} hrefForPage={(page) => pageHref(filters, page)} />;
}
