import { Icon, Button, Input, Label } from "@openbb/ui";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ExtensionInstance } from "../extensions/core/ExtensionEngine.browser";
import { getExtensionEngine } from "../extensions/core/ExtensionEngine.browser";
import { cn } from "../utils/cn";

interface ExtensionCardProps {
  extension: ExtensionInstance;
  onToggle: (extensionId: string) => void;
  onDelete: (extensionId: string) => void;
}

function ExtensionCard({
  extension,
  onToggle,
  onDelete,
}: ExtensionCardProps): JSX.Element {
  const { t } = useTranslation();
  const isLoaded = extension.status === "loaded";

  return (
    <div className="bg-white dark:bg-dark-900 rounded-lg shadow-md p-5 hover:shadow-lg transition-all duration-200">
      <div className="flex justify-between items-start mb-5">
        <div>
          <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">
            {extension.manifest.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {extension.manifest.publisher}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            v{extension.manifest.version}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={isLoaded ? "secondary" : "primary"}
            size="sm"
            onClick={() => onToggle(extension.id)}
          >
            {isLoaded ? t("extensions.disable") : t("extensions.enable")}
          </Button>
        </div>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-300 mb-5">
        {extension.manifest.description}
      </p>

      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <span
            className={cn(
              "px-2 py-1 rounded text-xs font-medium",
              extension.status === "loaded"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                : extension.status === "error"
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
            )}
          >
            {t(
              `extensions.status${extension.status.charAt(0).toUpperCase() + extension.status.slice(1)}`,
            )}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon
          onClick={() => onDelete(extension.id)}
          title={t("common.delete")}
          className="text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-300"
        >
          <Icon name={"trash-2" as never} size={16} />
        </Button>
      </div>
    </div>
  );
}

function ExtensionsPage() {
  console.log("=== EXTENSIONSPAGE COMPONENT LOADED ===");
  const { t } = useTranslation();
  const [extensions, setExtensions] = useState<ExtensionInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [installError, setInstallError] = useState<string | null>(null);
  const [installing, setInstalling] = useState(false);

  const extensionEngine = getExtensionEngine();

  useEffect(() => {
    const loadExtensions = async () => {
      setLoading(true);
      try {
        await extensionEngine.loadAllExtensions();
        setExtensions(extensionEngine.getExtensions());
      } catch (error) {
        console.error("Error loading extensions:", error);
      } finally {
        setLoading(false);
      }
    };

    loadExtensions();
  }, []);

  const handleToggleExtension = async (extensionId: string) => {
    const extension = extensionEngine.getExtension(extensionId);
    if (extension) {
      if (extension.status === "loaded") {
        extensionEngine.unloadExtension(extensionId);
      } else {
        await extensionEngine.loadExtension(extension.path);
      }
      // Reload extensions to get updated status
      setExtensions(extensionEngine.getExtensions());
    }
  };

  const handleDeleteExtension = async (extensionId: string) => {
    if (confirm(t("extensions.confirmDelete"))) {
      const extension = extensionEngine.getExtension(extensionId);
      if (extension) {
        extensionEngine.unloadExtension(extensionId);
        // Note: This only unloads, doesn't delete files. In a real app, we'd delete the directory.
        setExtensions(extensionEngine.getExtensions());
      }
    }
  };

  const handleInstallExtension = async (extensionPath: string) => {
    setInstalling(true);
    setInstallError(null);
    try {
      const result = await extensionEngine.loadExtension(extensionPath);
      if (result.success) {
        setExtensions(extensionEngine.getExtensions());
        setShowInstallModal(false);
      } else {
        setInstallError(result.error || t("extensions.installFailed"));
      }
    } catch (error) {
      setInstallError(t("extensions.installFailed"));
      console.error("Error installing extension:", error);
    } finally {
      setInstalling(false);
    }
  };

  return (
    <div className="work-area">
      <div className="work-area-header flex justify-between items-start">
        <div>
          <h1 className="work-area-title">{t("extensions.title")}</h1>
          <p className="work-area-subtitle">{t("extensions.subtitle")}</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowInstallModal(true)}
        >
          {t("extensions.installButton")}
        </Button>
      </div>

      {loading && (
        <div className="loading-state">
          <p>{t("extensions.loading")}</p>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-6">
          {extensions.length > 0 ? (
            extensions.map((extension) => (
              <ExtensionCard
                key={extension.id}
                extension={extension}
                onToggle={handleToggleExtension}
                onDelete={handleDeleteExtension}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Icon
                name={"package" as never}
                className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4"
              />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {t("extensions.noExtensions")}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t("extensions.noExtensionsDescription")}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Install Extension Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-900 rounded-lg shadow-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("extensions.installTitle")}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                icon
                onClick={() => setShowInstallModal(false)}
                title={t("common.close")}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <Icon name={"x" as never} size={20} />
              </Button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t("extensions.installDescription")}
            </p>
            <div className="mb-4 space-y-2">
              <Label>{t("extensions.extensionPath")}</Label>
              <Input
                type="text"
                id="extensionPath"
                placeholder={t("extensions.pathPlaceholder")}
              />
            </div>
            {installError && (
              <div className="mb-4 p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-sm">
                {installError}
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInstallModal(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const path = (
                    document.getElementById("extensionPath") as HTMLInputElement
                  ).value;
                  if (path) {
                    handleInstallExtension(path);
                  }
                }}
                disabled={installing}
              >
                {installing ? t("extensions.installing") : t("common.install")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/extensions")({
  component: ExtensionsPage,
});
