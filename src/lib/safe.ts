/**
 * Await a data-fetching promise, falling back to a default value on failure
 * instead of crashing the page. Silences Next's expected
 * `DYNAMIC_SERVER_USAGE` bailout (thrown when `cookies()` is touched during
 * the build's static-generation probe for an otherwise-dynamic route) so
 * build output only surfaces genuine errors (e.g. Supabase schema not yet
 * migrated, network failure).
 */
export async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch (err) {
    const digest = (err as { digest?: string } | null)?.digest;
    if (digest !== "DYNAMIC_SERVER_USAGE") {
      console.error("Data fetch failed, falling back to default:", err);
    }
    return fallback;
  }
}
