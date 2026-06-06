import type { TenantId } from "./tenant-id";

export type Tenant = {
  id: TenantId;
  name?: string;
};
