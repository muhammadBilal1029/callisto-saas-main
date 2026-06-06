import type { TenantId } from "../tenant/tenant-id";
import type { Project } from "./project";

export interface ProjectRepositoryPort {
  listByTenant(tenantId: TenantId): Promise<Project[]>;
}
