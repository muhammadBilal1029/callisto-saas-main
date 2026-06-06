import type { Metadata } from "next";
import { PortalDashboard } from "@/presentation/components/portal/portal-dashboard";

export const metadata: Metadata = {
  title: "Market Analysis Dashboard",
  description: "Demo Group — Sample Performance Dashboard",
};

export default function PortalPage() {
  return <PortalDashboard />;
}
