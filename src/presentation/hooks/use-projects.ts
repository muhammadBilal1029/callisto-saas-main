"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchProjects } from "@/presentation/api/projects";

export function projectQueryKey(tenantId: string) {
  return ["tenant", tenantId, "projects"] as const;
}

export function useProjects(tenantId: string) {
  return useQuery({
    queryKey: projectQueryKey(tenantId),
    queryFn: fetchProjects,
    enabled: Boolean(tenantId),
  });
}
