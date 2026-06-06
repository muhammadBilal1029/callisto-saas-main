import { ProjectsPanel } from "@/presentation/components/projects-panel";
import { createContainer } from "@/server/container";

export default async function DashboardPage() {
  const { getTenantContext } = await createContainer();
  const tenant = await getTenantContext.execute();

  if (!tenant) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Session tenant
        </p>
        <p className="mt-1 font-mono text-sm text-zinc-800 dark:text-zinc-200">
          {tenant.id}
        </p>
        {tenant.name ? (
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {tenant.name}
          </p>
        ) : null}
      </div>
      <ProjectsPanel tenantId={tenant.id} />
    </div>
  );
}
