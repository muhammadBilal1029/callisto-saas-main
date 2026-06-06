import { ListOrganizationsForEmail } from "@/application/organization/list-organizations-for-email";
import { Auth0ManagementOrganizationLookup } from "@/infrastructure/auth0/auth0-management-organization-lookup.adapter";

type OrganizationServices = {
  listOrganizationsForEmail: ListOrganizationsForEmail;
};

let services: OrganizationServices | null = null;

export function getOrganizationServices(): OrganizationServices {
  if (!services) {
    const domain = process.env.AUTH0_DOMAIN;
    if (!domain) {
      throw new Error("AUTH0_DOMAIN is required.");
    }

    const organizationLookup = new Auth0ManagementOrganizationLookup(domain);
    services = {
      listOrganizationsForEmail: new ListOrganizationsForEmail(
        organizationLookup,
      ),
    };
  }

  return services;
}
