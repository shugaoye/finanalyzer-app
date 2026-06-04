import { Icon } from "@openbb/ui";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { WidgetConfig } from "../../services/widgets/widgetService";

interface Dashboard {
  id: string;
  name: string;
  description?: string;
  widgetCount?: number;
  lastModified?: string;
}

interface DashboardSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (dashboardId: string, widgets: WidgetConfig[]) => void;
  selectedWidgets: WidgetConfig[];
  dashboards: Dashboard[];
  loading?: boolean;
  error?: string;
}

function DashboardSelectionModal({
  isOpen,
  onClose,
  onAdd,
  selectedWidgets,
  dashboards,
  loading = false,
  error = "",
}: DashboardSelectionModalProps) {
  const { t } = useTranslation();
  const [selectedDashboard, setSelectedDashboard] = useState<string>(
    dashboards[0]?.id || "",
  );

  const modalRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const isDark = document.documentElement.classList.contains("dark");
    if (modalRootRef.current) {
      if (isDark) {
        modalRootRef.current.classList.add("dark");
      } else {
        modalRootRef.current.classList.remove("dark");
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAdd = () => {
    if (selectedDashboard) {
      onAdd(selectedDashboard, selectedWidgets);
    }
  };

  return (
    <div ref={modalRootRef} className="modal-overlay">
      <div className="modal-content w-full max-w-md md:max-w-lg lg:max-w-xl mx-4">
        <div className="modal-header">
          <h2 className="modal-title">{t("dashboardModal.title")}</h2>
          <button className="modal-close" onClick={onClose}>
            <Icon name={"x" as never} size={20} />
          </button>
        </div>

        <div className="modal-body">
          {loading && (
            <div className="loading-state">
              <p>{t("dashboardModal.loading")}</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>{t("dashboardModal.error")}</p>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => {
                  /* Retry logic */
                }}
              >
                {t("dashboardModal.retry")}
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              {selectedWidgets.length > 0 && (
                <div className="widget-summary">
                  <p>
                    {t("dashboardModal.widgetSummary", {
                      count: selectedWidgets.length,
                    })}
                  </p>
                </div>
              )}

              {dashboards.length === 0 ? (
                <div className="empty-state">
                  <p>{t("dashboardModal.noDashboards")}</p>
                  <button className="btn btn-primary">
                    {t("dashboardModal.createDashboard")}
                  </button>
                </div>
              ) : (
                <div className="dashboard-list">
                  {dashboards.map((dashboard) => (
                    <div
                      key={dashboard.id}
                      className={`dashboard-item ${selectedDashboard === dashboard.id ? "selected" : ""}`}
                      onClick={() => setSelectedDashboard(dashboard.id)}
                    >
                      <div className="dashboard-radio">
                        <input
                          type="radio"
                          name="dashboard"
                          value={dashboard.id}
                          checked={selectedDashboard === dashboard.id}
                          onChange={() => setSelectedDashboard(dashboard.id)}
                        />
                      </div>
                      <div className="dashboard-info">
                        <h3 className="dashboard-name">{dashboard.name}</h3>
                        {dashboard.description && (
                          <p className="dashboard-description">
                            {dashboard.description}
                          </p>
                        )}
                        <div className="dashboard-meta">
                          {dashboard.widgetCount !== undefined && (
                            <span className="dashboard-meta-item">
                              {dashboard.widgetCount} widgets
                            </span>
                          )}
                          {dashboard.lastModified && (
                            <span className="dashboard-meta-item">
                              Last modified: {dashboard.lastModified}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            {t("dashboardModal.cancel")}
          </button>
          <button
            className="btn btn-primary ml-2"
            onClick={handleAdd}
            disabled={!selectedDashboard}
          >
            {t("dashboardModal.add")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DashboardSelectionModal;
