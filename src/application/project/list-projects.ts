import type { TenantId } from "@/domain/tenant/tenant-id";
import type { Project } from "@/domain/project/project";
import type { ProjectRepositoryPort } from "@/domain/project/project.repository.port";

export class ListProjects {
  constructor(private readonly projectRepository: ProjectRepositoryPort) {}

  async execute(tenantId: TenantId): Promise<Project[]> {
    return this.projectRepository.listByTenant(tenantId);
  }
}
