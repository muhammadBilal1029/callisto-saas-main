import type { TenantContextPort } from "@/domain/tenant/tenant-context.port";
import type { Tenant } from "@/domain/tenant/tenant";
import { TenantId } from "@/domain/tenant/tenant-id";

export type Auth0SessionUser = {
  org_id?: string;
  org_name?: string;
  [key: string]: unknown;
};

export class Auth0TenantContextAdapter implements TenantContextPort {
  constructor(
    private readonly getUser: () => Promise<Auth0SessionUser | null | undefined>,
  ) {}

  async getActiveTenant(): Promise<Tenant | null> {
    const user = await this.getUser();
    if (!user?.org_id || typeof user.org_id !== "string") {
      return null;
    }

    const id = TenantId(user.org_id);
    const name = typeof user.org_name === "string" ? user.org_name : undefined;

    return { id, name };
  }
}
