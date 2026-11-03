/** Only same-site paths, so ?next= can never send people to another website. */
export function safeNext(value: unknown): string | null {
  const next = Array.isArray(value) ? value[0] : value;
  return typeof next === "string" &&
    next.startsWith("/") &&
    !next.startsWith("//") &&
    !next.includes("\\")
    ? next
    : null;
}
