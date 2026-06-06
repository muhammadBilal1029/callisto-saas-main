import type { TenantContextPort } from "@/domain/tenant/tenant-context.port";
import type { Tenant } from "@/domain/tenant/tenant";

export class GetTenantContext {
  constructor(private readonly tenantContext: TenantContextPort) {}

  async execute(): Promise<Tenant | null> {
    return this.tenantContext.getActiveTenant();
  }
}
