import { auth0 } from "@/lib/auth0";
import { GetTenantContext } from "@/application/tenant/get-tenant-context";
import { ListProjects } from "@/application/project/list-projects";
import { Auth0TenantContextAdapter } from "@/infrastructure/auth/auth0-tenant-context.adapter";
import { InMemoryProjectRepository } from "@/infrastructure/persistence/in-memory-project.repository";

const projectRepository = new InMemoryProjectRepository();

export async function createContainer() {
  const session = await auth0.getSession();
  const tenantContext = new Auth0TenantContextAdapter(
    async () => session?.user,
  );

  return {
    session,
    getTenantContext: new GetTenantContext(tenantContext),
    listProjects: new ListProjects(projectRepository),
  };
}
