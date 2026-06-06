import type { TenantId } from "../tenant/tenant-id";

export type ProjectStatus = "active" | "archived";

export type Project = {
  id: string;
  tenantId: TenantId;
  name: string;
  status: ProjectStatus;
};
