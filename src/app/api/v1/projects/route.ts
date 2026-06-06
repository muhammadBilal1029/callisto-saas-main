import { NextResponse } from "next/server";
import { createContainer } from "@/server/container";

export async function GET() {
  const { session, getTenantContext, listProjects } = await createContainer();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenant = await getTenantContext.execute();
  if (!tenant) {
    return NextResponse.json(
      { error: "Organization context required" },
      { status: 403 },
    );
  }

  const projects = await listProjects.execute(tenant.id);

  return NextResponse.json({
    projects: projects.map((project) => ({
      id: project.id,
      tenantId: project.tenantId,
      name: project.name,
      status: project.status,
    })),
  });
}
