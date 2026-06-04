import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardCanvas } from "../../components/dashboard/DashboardCanvas";
import { getDashboards } from "../../services/dashboardApi";
import { setActiveDashboardId } from "../../services/dashboardSession";

export const Route = createFileRoute("/app/$id")({
  component: DashboardRouteComponent,
});

function DashboardRouteComponent() {
  const { id } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [resolvedId, setResolvedId] = useState<string>(id);
  const activeTab = (search as { tab?: string }).tab;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const list = await getDashboards().catch(() => []);

        if (id && id !== "new") {
          const exists = list.find((d: { id: string }) => d.id === id);
          if (exists) {
            setResolvedId(id);
            setActiveDashboardId(id);
          }
        } else if (id === "new" || list.length === 0) {
          setResolvedId("");
        } else {
          const first = list[0];
          setResolvedId(first.id);
          setActiveDashboardId(first.id);
          window.location.replace(`/app/${first.id}`);
          return;
        }
      } catch {
        setResolvedId(id);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handleTabChange = (tabId: string) => {
    navigate({
      to: "/app/$id",
      params: { id: resolvedId },
      search: (prev) => ({ ...prev, tab: tabId }),
      replace: false,
    });
  };

  if (loading) {
    return (
      <div className="dashboard-canvas">
        <div className="dashboard-loading">Loading...</div>
      </div>
    );
  }

  return (
    <DashboardCanvas
      dashboardId={resolvedId}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    />
  );
}
