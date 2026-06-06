"use client";

import { useActionState } from "react";
import {
  continueWithOrganization,
  type LoginFlowState,
} from "@/app/login/actions";
import type { OrganizationMembership } from "@/domain/organization/organization-membership";

type MembershipOrgPickerProps = {
  email: string;
  organizations: OrganizationMembership[];
};

export function MembershipOrgPicker({
  email,
  organizations,
}: MembershipOrgPickerProps) {
  const [state, formAction, isPending] = useActionState(
    continueWithOrganization,
    {} satisfies LoginFlowState,
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Signed in as <span className="font-medium text-zinc-900 dark:text-zinc-100">{email}</span>.
        Choose a workspace:
      </p>

      {state.error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      ) : null}

      <ul className="space-y-2">
        {organizations.map((org) => (
          <li key={org.id}>
            <form action={formAction}>
              <input type="hidden" name="email" value={email} />
              <input type="hidden" name="organizationId" value={org.id} />
              <button
                type="submit"
                disabled={isPending}
                className="flex w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-4 py-3 text-left text-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:border-zinc-500 dark:hover:bg-zinc-900"
              >
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {org.name}
                </span>
                <span className="text-zinc-500">Continue →</span>
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
