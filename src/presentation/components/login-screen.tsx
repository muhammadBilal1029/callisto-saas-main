import Link from "next/link";
import { LoginFlow } from "@/presentation/components/login-flow";

type LoginScreenProps = {
  error?: string;
  message?: string;
  detail?: string;
  hasSessionWithoutOrg?: boolean;
  workspaceHint?: string;
};

export function LoginScreen({
  error,
  message,
  detail,
  hasSessionWithoutOrg,
  workspaceHint,
}: LoginScreenProps) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="mb-8 text-center">
        <Link
          href="/"
          className="text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          ← Callisto SaaS
        </Link>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {workspaceHint
            ? `Signing in via workspace "${workspaceHint}".`
            : "Enter your work email. You will only see workspaces you belong to."}
        </p>
      </div>

      <div className="space-y-6">
        {message ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              Sign-in failed ({error ?? "error"})
            </p>
            <p className="mt-1 text-sm text-red-700 dark:text-red-300">{message}</p>
            {detail ? (
              <p className="mt-2 font-mono text-xs text-red-600 dark:text-red-400">
                {detail}
              </p>
            ) : null}
          </div>
        ) : null}

        {hasSessionWithoutOrg ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            Your account is signed in but not linked to a workspace. Enter your
            email below to continue.
          </p>
        ) : null}

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <LoginFlow />
        </div>

        <p className="text-center text-xs text-zinc-500">
          You will be redirected to Auth0 to verify your identity for the
          selected workspace only.
        </p>
      </div>
    </div>
  );
}
