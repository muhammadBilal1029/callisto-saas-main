import { redirect } from "next/navigation";
import { AppShell } from "@/presentation/components/app-shell";
import { createContainer } from "@/server/container";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, getTenantContext } = await createContainer();

  if (!session) {
    redirect("/login");
  }

  const tenant = await getTenantContext.execute();

  return (
    <AppShell
      user={session.user}
      tenantId={tenant?.id}
      tenantName={tenant?.name}
    >
      {children}
    </AppShell>
  );
}
