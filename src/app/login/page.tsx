import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { resolveOrgFromHost } from "@/config/workspace-registry";
import { LoginScreen } from "@/presentation/components/login-screen";
import { createContainer } from "@/server/container";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; detail?: string }>;
}) {
  const { session, getTenantContext } = await createContainer();
  const tenant = await getTenantContext.execute();
  const params = await searchParams;

  if (tenant) {
    redirect("/dashboard");
  }

  const host = (await headers()).get("host") ?? "";
  const fromHost = resolveOrgFromHost(host);

  if (fromHost && !params.error) {
    redirect(
      `/auth/login?organization=${encodeURIComponent(fromHost.orgId)}&returnTo=/dashboard`,
    );
  }

  return (
    <LoginScreen
      error={params.error}
      message={params.message}
      detail={params.detail}
      hasSessionWithoutOrg={Boolean(session) && !tenant}
      workspaceHint={fromHost?.slug}
    />
  );
}
