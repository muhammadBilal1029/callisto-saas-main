import type { Tenant } from "./tenant";

export interface TenantContextPort {
  getActiveTenant(): Promise<Tenant | null>;
}
