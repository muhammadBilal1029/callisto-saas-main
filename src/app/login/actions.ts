"use server";

import { redirect } from "next/navigation";
import { getOrganizationServices } from "@/server/organization-services";
import type { OrganizationMembership } from "@/domain/organization/organization-membership";

export type LoginFlowState = {
  error?: string;
  step?: "organizations";
  email?: string;
  organizations?: OrganizationMembership[];
};

export async function submitLoginEmail(
  _prev: LoginFlowState,
  formData: FormData,
): Promise<LoginFlowState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email) {
    return { error: "Enter your work email address." };
  }

  try {
    const organizations =
      await getOrganizationServices().listOrganizationsForEmail.execute(email);

    if (organizations.length === 0) {
      return {
        error:
          "No workspace access found for that email. Contact your administrator.",
      };
    }

    if (organizations.length === 1) {
      const org = organizations[0];
      redirect(buildAuthLoginUrl(org.id, email));
    }

    return {
      step: "organizations",
      email,
      organizations,
    };
  } catch (cause) {
    console.error("[login] organization lookup failed", cause);
    return {
      error:
        "Unable to look up your workspace right now. Try again or contact support.",
    };
  }
}

export async function continueWithOrganization(
  _prev: LoginFlowState,
  formData: FormData,
): Promise<LoginFlowState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const organizationId = String(formData.get("organizationId") ?? "").trim();

  if (!email || !organizationId) {
    return { error: "Invalid sign-in request. Start again." };
  }

  try {
    const organizations =
      await getOrganizationServices().listOrganizationsForEmail.execute(email);

    const allowed = organizations.some((org) => org.id === organizationId);
    if (!allowed) {
      return { error: "You do not have access to that workspace." };
    }

    redirect(buildAuthLoginUrl(organizationId, email));
  } catch (cause) {
    console.error("[login] organization verification failed", cause);
    return {
      error:
        "Unable to verify your workspace. Try again or contact support.",
    };
  }
}

function buildAuthLoginUrl(organizationId: string, email: string): string {
  const params = new URLSearchParams({
    organization: organizationId,
    login_hint: email,
    returnTo: "/dashboard",
  });
  return `/auth/login?${params.toString()}`;
}
