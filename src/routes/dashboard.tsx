import { createFileRoute, redirect } from "@tanstack/react-router";
import { getActiveDashboardId } from "../services/dashboardSession";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    const activeId = getActiveDashboardId();
    if (activeId) {
      throw redirect({ to: "/app/$id", params: { id: activeId } });
    }
    throw redirect({ to: "/app" });
  },
  component: () => null,
});
