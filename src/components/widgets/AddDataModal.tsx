import { Icon } from "@openbb/ui";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface AddDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "plugins" | "backend";

function AddDataModal({ isOpen, onClose }: AddDataModalProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>("plugins");
  const [loading] = useState(false);
  const [error, setError] = useState("");

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

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setError("");
  };

  const handleInstallPlugin = () => {
    // Implement plugin installation logic
    console.log("Installing plugin...");
  };

  const handleAddBackend = () => {
    // Implement backend addition logic
    console.log("Adding backend...");
  };

  return (
    <div ref={modalRootRef} className="modal-overlay">
      <div className="modal-content w-full max-w-md md:max-w-lg lg:max-w-xl mx-4">
        <div className="modal-header">
          <h2 className="modal-title">{t("addDataModal.title")}</h2>
          <button className="modal-close" onClick={onClose}>
            <Icon name={"x" as never} size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-tabs">
            <button
              className={`modal-tab ${activeTab === "plugins" ? "active" : ""}`}
              onClick={() => handleTabChange("plugins")}
            >
              {t("addDataModal.installPlugins")}
            </button>
            <button
              className={`modal-tab ${activeTab === "backend" ? "active" : ""}`}
              onClick={() => handleTabChange("backend")}
            >
              {t("addDataModal.addBackend")}
            </button>
          </div>

          {loading && (
            <div className="loading-state">
              <p>{t("addDataModal.loading")}</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>{t("addDataModal.error")}</p>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => setError("")}
              >
                {t("addDataModal.retry")}
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="tab-content">
              {activeTab === "plugins" && (
                <div className="plugins-tab">
                  <div className="plugin-upload">
                    <h3>{t("addDataModal.pluginUpload")}</h3>
                    <div className="upload-area">
                      <input type="file" className="file-input" />
                      <p>Drag and drop plugin files here or click to browse</p>
                    </div>
                    <button
                      className="btn btn-primary mt-4"
                      onClick={handleInstallPlugin}
                    >
                      {t("addDataModal.install")}
                    </button>
                  </div>

                  <div className="plugin-marketplace mt-6">
                    <h3>{t("addDataModal.pluginMarketplace")}</h3>
                    <div className="marketplace-items">
                      {/* Marketplace plugins would be listed here */}
                      <div className="marketplace-item">
                        <h4>Chart Widget Plugin</h4>
                        <p>Advanced charting capabilities for financial data</p>
                        <button className="btn btn-sm btn-primary">
                          {t("addDataModal.install")}
                        </button>
                      </div>
                      <div className="marketplace-item">
                        <h4>Newsfeed Plugin</h4>
                        <p>Real-time news aggregation for stocks</p>
                        <button className="btn btn-sm btn-primary">
                          {t("addDataModal.install")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "backend" && (
                <div className="backend-tab">
                  <div className="connection-form">
                    <h3>{t("addDataModal.connectionForm")}</h3>
                    <form>
                      <div className="form-group">
                        <label>{t("addDataModal.connectionType")}</label>
                        <select className="form-select">
                          <option value="openbb">OpenBB</option>
                          <option value="custom">Custom API</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Name</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Enter connection name"
                        />
                      </div>
                      <div className="form-group">
                        <label>URL</label>
                        <input
                          type="url"
                          className="form-input"
                          placeholder="Enter API URL"
                        />
                      </div>
                      <div className="form-group">
                        <label>Authentication</label>
                        <select className="form-select">
                          <option value="none">None</option>
                          <option value="api_key">API Key</option>
                          <option value="basic">Basic Auth</option>
                        </select>
                      </div>
                      <div className="form-actions">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => console.log("Testing connection...")}
                        >
                          {t("addDataModal.testConnection")}
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary ml-2"
                          onClick={handleAddBackend}
                        >
                          {t("addDataModal.addConnection")}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            {t("addDataModal.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddDataModal;
