import type { OrganizationLookupPort } from "@/domain/organization/organization-lookup.port";
import type { OrganizationMembership } from "@/domain/organization/organization-membership";
import { getAuth0ManagementToken } from "./auth0-management-token";

type Auth0User = { user_id: string };
type Auth0Organization = {
  id: string;
  name: string;
  display_name?: string;
};

export class Auth0ManagementOrganizationLookup implements OrganizationLookupPort {
  constructor(private readonly domain: string) {}

  async findMembershipsByEmail(email: string): Promise<OrganizationMembership[]> {
    const token = await getAuth0ManagementToken();
    const headers = { Authorization: `Bearer ${token}` };

    const usersResponse = await fetch(
      `https://${this.domain}/api/v2/users-by-email?email=${encodeURIComponent(email)}`,
      { headers, cache: "no-store" },
    );

    if (!usersResponse.ok) {
      const body = await usersResponse.text();
      throw new Error(`Auth0 users-by-email failed: ${body}`);
    }

    const users = (await usersResponse.json()) as Auth0User[];
    if (users.length === 0) {
      return [];
    }

    const membershipsByOrgId = new Map<string, OrganizationMembership>();

    for (const user of users) {
      const orgsResponse = await fetch(
        `https://${this.domain}/api/v2/users/${encodeURIComponent(user.user_id)}/organizations`,
        { headers, cache: "no-store" },
      );

      if (!orgsResponse.ok) {
        const body = await orgsResponse.text();
        throw new Error(`Auth0 user organizations failed: ${body}`);
      }

      const orgs = (await orgsResponse.json()) as Auth0Organization[];

      for (const org of orgs) {
        membershipsByOrgId.set(org.id, {
          id: org.id,
          name: org.display_name ?? org.name,
        });
      }
    }

    return [...membershipsByOrgId.values()].sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }
}
