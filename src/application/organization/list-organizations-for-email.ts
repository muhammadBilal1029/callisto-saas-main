import type { OrganizationLookupPort } from "@/domain/organization/organization-lookup.port";
import type { OrganizationMembership } from "@/domain/organization/organization-membership";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class ListOrganizationsForEmail {
  constructor(private readonly organizationLookup: OrganizationLookupPort) {}

  async execute(email: string): Promise<OrganizationMembership[]> {
    const normalized = email.trim().toLowerCase();

    if (!EMAIL_PATTERN.test(normalized)) {
      return [];
    }

    return this.organizationLookup.findMembershipsByEmail(normalized);
  }
}
