"use client";

import { useActionState } from "react";
import {
  submitLoginEmail,
  type LoginFlowState,
} from "@/app/login/actions";
import { EmailLoginForm } from "@/presentation/components/email-login-form";
import { MembershipOrgPicker } from "@/presentation/components/membership-org-picker";

const initialState: LoginFlowState = {};

export function LoginFlow() {
  const [state, formAction, isPending] = useActionState(
    submitLoginEmail,
    initialState,
  );

  if (state.step === "organizations" && state.email && state.organizations) {
    return (
      <MembershipOrgPicker
        email={state.email}
        organizations={state.organizations}
      />
    );
  }

  return (
    <EmailLoginForm state={state} formAction={formAction} isPending={isPending} />
  );
}
