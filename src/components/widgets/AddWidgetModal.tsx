import { Icon } from "@openbb/ui";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { WidgetConfig } from "../../services/widgets/widgetService";

interface Dashboard {
  id: string;
  name: string;
  description?: string;
}

interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (dashboardId: string, widgets: WidgetConfig[]) => Promise<void>;
  selectedWidgets: WidgetConfig[];
  dashboards: Dashboard[];
  loading?: boolean;
  error?: string;
}

function AddWidgetModal({
  isOpen,
  onClose,
  onAdd,
  selectedWidgets,
  dashboards,
  loading = false,
  error = "",
}: AddWidgetModalProps) {
  const { t } = useTranslation();
  const [selectedDashboard, setSelectedDashboard] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

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

  const handleAdd = async () => {
    if (selectedDashboard && selectedWidgets.length > 0) {
      setIsAdding(true);
      setAddSuccess(null);
      try {
        await onAdd(selectedDashboard, selectedWidgets);
        setAddSuccess({
          success: true,
          message: t("widgetModal.addSuccess"),
        });
        setTimeout(() => {
          onClose();
        }, 1500);
      } catch {
        setAddSuccess({
          success: false,
          message: t("widgetModal.addFailed"),
        });
      } finally {
        setIsAdding(false);
      }
    }
  };

  const handleCreateNewDashboard = () => {
    console.log("Create new dashboard");
  };

  return (
    <div ref={modalRootRef} className="modal-overlay">
      <div className="modal-content w-full max-w-md md:max-w-lg lg:max-w-xl mx-4">
        <div className="modal-header">
          <h2 className="modal-title">{t("widgetModal.title")}</h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            title={t("common.close")}
          >
            <Icon name={"x" as never} size={20} />
          </button>
        </div>

        <div className="modal-body">
          {loading && (
            <div className="loading-state">
              <p>{t("widgetModal.loading")}</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p className="text-alert-informative">{error}</p>
              <button
                type="button"
                className="btn btn-sm btn-primary mt-2"
                onClick={() => {
                  /* Retry logic */
                }}
              >
                {t("widgetModal.retry")}
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Add Success Message */}
              {addSuccess && (
                <div
                  className={`rounded-sm px-3 py-2 text-sm mb-4 ${
                    addSuccess.success
                      ? "bg-success-bg text-success-label"
                      : "bg-error-bg text-error-label"
                  }`}
                >
                  {addSuccess.message}
                </div>
              )}

              {/* Widget Information */}
              {selectedWidgets.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-ds-text-body">
                    {selectedWidgets.length} widget
                    {selectedWidgets.length > 1 ? "s" : ""} selected
                  </p>
                </div>
              )}

              {/* Create New Dashboard Button */}
              <button
                type="button"
                className="w-full mb-4 py-2 px-3 rounded-sm border border-dashed border-light-300 dark:border-dark-500 text-sm text-light-600 dark:text-dark-400 hover:border-main-100 hover:text-main-100 dark:hover:border-main-100 dark:hover:text-main-100 transition-colors flex items-center justify-center gap-2"
                onClick={handleCreateNewDashboard}
              >
                <Icon name={"plus" as never} size={16} />
                {t("widgetModal.createNewDashboard")}
              </button>

              {/* Dashboards Section */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-light-500 dark:text-dark-500 uppercase tracking-wider mb-3">
                  {t("widgetModal.dashboards")}
                </h3>

                {dashboards.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-light-500 dark:text-dark-500">
                      {t("widgetModal.noDashboardsAvailable")}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {dashboards.map((dashboard) => (
                      <div
                        key={dashboard.id}
                        className={`flex items-center gap-3 p-3 rounded-sm cursor-pointer transition-colors ${
                          selectedDashboard === dashboard.id
                            ? "bg-main-100/10 border border-main-100/30"
                            : "hover:bg-light-100 dark:hover:bg-dark-800 border border-transparent"
                        }`}
                        onClick={() => setSelectedDashboard(dashboard.id)}
                      >
                        <div className="flex-shrink-0">
                          <input
                            type="checkbox"
                            checked={selectedDashboard === dashboard.id}
                            onChange={() => setSelectedDashboard(dashboard.id)}
                            title={`Select ${dashboard.name}`}
                            className="w-4 h-4 rounded border-light-300 dark:border-dark-600 text-main-100 focus:ring-main-100 focus:ring-2 bg-input-field-bg"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-light-900 dark:text-white truncate">
                            {dashboard.name}
                          </p>
                          {dashboard.description && (
                            <p className="text-xs text-light-500 dark:text-dark-500 truncate mt-0.5">
                              {dashboard.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isAdding}
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            className="btn btn-primary ml-2"
            onClick={handleAdd}
            disabled={
              !selectedDashboard ||
              selectedWidgets.length === 0 ||
              loading ||
              isAdding ||
              addSuccess?.success
            }
          >
            {isAdding && (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
            )}
            {isAdding ? t("widgetModal.adding") : t("widgetModal.add")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddWidgetModal;
