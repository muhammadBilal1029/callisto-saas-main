export type TenantId = string & { readonly __brand: "TenantId" };

export class InvalidTenantIdError extends Error {
  constructor(value: string) {
    super(`Invalid tenant id: ${value}. Expected Auth0 organization id (org_...).`);
    this.name = "InvalidTenantIdError";
  }
}

export function TenantId(value: string): TenantId {
  if (!value.startsWith("org_")) {
    throw new InvalidTenantIdError(value);
  }
  return value as TenantId;
}

export function tryTenantId(value: unknown): TenantId | null {
  if (typeof value !== "string" || !value.startsWith("org_")) {
    return null;
  }
  return value as TenantId;
}
