"use client";

import { useProjects } from "@/presentation/hooks/use-projects";

type ProjectsPanelProps = {
  tenantId: string;
};

export function ProjectsPanel({ tenantId }: ProjectsPanelProps) {
  const { data, isPending, isError, error, refetch } = useProjects(tenantId);

  if (isPending) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
        Loading projects…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/40">
        <p className="text-sm font-medium text-red-800 dark:text-red-200">
          {error.message}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 rounded-md bg-red-800 px-3 py-1.5 text-sm text-white hover:bg-red-900"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Projects
        </h1>
        <p className="text-sm text-zinc-500">
          Tenant-scoped data from the in-memory repository.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">ID</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((project) => (
              <tr
                key={project.id}
                className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
              >
                <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">
                  {project.name}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      project.status === "active"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                    }`}
                  >
                    {project.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                  {project.id}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
