import type { OrganizationMembership } from "./organization-membership";

export interface OrganizationLookupPort {
  findMembershipsByEmail(email: string): Promise<OrganizationMembership[]>;
}
