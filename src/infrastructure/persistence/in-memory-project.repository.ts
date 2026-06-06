import type { TenantId } from "@/domain/tenant/tenant-id";
import type { Project } from "@/domain/project/project";
import type { ProjectRepositoryPort } from "@/domain/project/project.repository.port";

const DEFAULT_PROJECTS: Record<string, Omit<Project, "tenantId">[]> = {
  default: [
    { id: "proj-1", name: "Customer onboarding", status: "active" },
    { id: "proj-2", name: "Q2 roadmap", status: "active" },
    { id: "proj-3", name: "Legacy migration", status: "archived" },
  ],
};

function parseDemoOrgProjects(): Record<string, Omit<Project, "tenantId">[]> {
  const raw = process.env.DEMO_ORG_PROJECTS;
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as Record<
      string,
      Omit<Project, "tenantId">[]
    >;
    return parsed;
  } catch {
    return {};
  }
}

const demoOrgProjects = parseDemoOrgProjects();

export class InMemoryProjectRepository implements ProjectRepositoryPort {
  async listByTenant(tenantId: TenantId): Promise<Project[]> {
    const templates =
      demoOrgProjects[tenantId] ?? DEFAULT_PROJECTS.default ?? [];

    return templates.map((project) => ({
      ...project,
      tenantId,
    }));
  }
}
