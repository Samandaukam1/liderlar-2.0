const ADABIYOTX_HOSTNAME = "adabiyotx.uz";
const BOOK_PATHNAME_PATTERN = /^\/book\/[0-9a-fA-F-]{36}\/?$/;

/**
 * A book link is only clickable when it is unmistakably an AdabiyotX book page.
 * The URL is used verbatim as an `href` so the OS can hand it to the AdabiyotX
 * app through Universal / App Links — nothing may be appended to it.
 */
export function isValidAdabiyotXBookUrl(value: string | null | undefined): boolean {
  if (!value) return false;

  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === ADABIYOTX_HOSTNAME &&
      BOOK_PATHNAME_PATTERN.test(url.pathname)
    );
  } catch {
    return false;
  }
}

export function adabiyotXBookHref(
  value: string | null | undefined
): string | null {
  return isValidAdabiyotXBookUrl(value) ? value! : null;
}

export function isSafeHttpUrl(value: string | null | undefined): boolean {
  if (!value) return false;

  try {
    const { protocol } = new URL(value);
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
}
