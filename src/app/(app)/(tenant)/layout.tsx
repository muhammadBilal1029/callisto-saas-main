import { redirect } from "next/navigation";
import { TenantProvider } from "@/presentation/providers/tenant-provider";
import { createContainer } from "@/server/container";

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getTenantContext } = await createContainer();
  const tenant = await getTenantContext.execute();

  if (!tenant) {
    redirect("/login");
  }

  return <TenantProvider tenant={tenant}>{children}</TenantProvider>;
}
