import { z } from "zod";

const projectSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  status: z.enum(["active", "archived"]),
});

const projectsResponseSchema = z.object({
  projects: z.array(projectSchema),
});

export type ProjectDto = z.infer<typeof projectSchema>;

export async function fetchProjects(): Promise<ProjectDto[]> {
  const response = await fetch("/api/v1/projects", {
    credentials: "include",
  });

  if (!response.ok) {
    const message =
      response.status === 403
        ? "Organization context required"
        : response.status === 401
          ? "Unauthorized"
          : "Failed to load projects";
    throw new Error(message);
  }

  const json: unknown = await response.json();
  const parsed = projectsResponseSchema.parse(json);
  return parsed.projects;
}
