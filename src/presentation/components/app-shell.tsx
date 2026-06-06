import { UserMenu } from "@/presentation/components/user-menu";

type AppShellProps = {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    picture?: string | null;
    org_id?: string;
  };
  tenantName?: string;
  tenantId?: string;
};

export function AppShell({
  children,
  user,
  tenantName,
  tenantId,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <aside className="hidden w-56 shrink-0 border-r border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 md:block">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Workspace
        </p>
        <p className="mt-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {tenantName ?? "No organization"}
        </p>
        {tenantId ? (
          <p className="mt-1 truncate font-mono text-xs text-zinc-500">
            {tenantId}
          </p>
        ) : null}
        <nav className="mt-6 space-y-1">
          <a
            href="/dashboard"
            className="block rounded-md bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
          >
            Projects
          </a>
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Workspace
              </p>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {tenantName ?? "Signed in"}
              </p>
            </div>
            <UserMenu
              name={user.name}
              email={user.email}
              picture={user.picture}
            />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
