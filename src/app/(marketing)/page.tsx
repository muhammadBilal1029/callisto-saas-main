import Link from "next/link";
import { auth0 } from "@/lib/auth0";

export default async function MarketingPage() {
  const session = await auth0.getSession();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Callisto SaaS
          </span>
          {session ? (
            <Link
              href="/dashboard"
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              Go to dashboard
            </Link>
          ) : (
            <a
              href="/login"
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              Log in
            </a>
          )}
        </div>
      </header>
      <main className="mx-auto flex max-w-5xl flex-1 flex-col justify-center px-6 py-16">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          Next.js · Auth0 Organizations · React Query
        </p>
        <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          B2B SaaS starter with framework-agnostic layers
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          Tenant identity comes from Auth0 Organizations (<code>org_id</code>
          ). Domain and application logic stay free of Next.js and Auth0 imports;
          React Query lives at the UI boundary.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="/login"
            className="rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Get started
          </a>
          <Link
            href="/dashboard"
            className="rounded-md border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
