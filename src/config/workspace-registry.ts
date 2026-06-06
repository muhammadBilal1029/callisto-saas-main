/**
 * Server-only workspace → Auth0 organization mapping.
 * Never expose this map to the client (no NEXT_PUBLIC_ prefix).
 */
export type WorkspaceEntry = {
  slug: string;
  orgId: string;
  displayName?: string;
};

function parseOrgSlugMap(): Record<string, string> {
  const raw = process.env.ORG_SLUG_MAP;
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    return Object.fromEntries(
      Object.entries(parsed).map(([slug, orgId]) => [
        slug.toLowerCase().trim(),
        orgId,
      ]),
    );
  } catch {
    return {};
  }
}

export function resolveOrgFromSlug(slug: string): WorkspaceEntry | null {
  const normalized = slug.toLowerCase().trim();
  if (!normalized) {
    return null;
  }

  const orgId = parseOrgSlugMap()[normalized];
  if (!orgId || !orgId.startsWith("org_")) {
    return null;
  }

  return { slug: normalized, orgId };
}

/**
 * Resolve tenant from subdomain, e.g. acme.localhost:3000 → acme
 */
export function resolveOrgFromHost(host: string): WorkspaceEntry | null {
  const rootHost = (process.env.APP_ROOT_HOST ?? "localhost:3000")
    .toLowerCase()
    .trim();
  const hostname = host.toLowerCase().split(":")[0] ?? "";
  const rootHostname = rootHost.split(":")[0] ?? rootHost;

  if (hostname === rootHostname) {
    return null;
  }

  const suffix = `.${rootHostname}`;
  if (!hostname.endsWith(suffix)) {
    return null;
  }

  const slug = hostname.slice(0, -suffix.length);
  if (!slug || slug.includes(".")) {
    return null;
  }

  return resolveOrgFromSlug(slug);
}
