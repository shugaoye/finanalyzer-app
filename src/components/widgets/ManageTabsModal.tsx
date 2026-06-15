import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Icon } from "@openbb/ui";

export interface TabEntry {
  id: string;
  name: string;
  isNew?: boolean;
}

interface ManageTabsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTabs: TabEntry[];
  onSave: (tabs: TabEntry[]) => void;
}

export function ManageTabsModal({
  isOpen,
  onClose,
  initialTabs,
  onSave,
}: ManageTabsModalProps): JSX.Element | null {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDivElement>(null);
  const [tabs, setTabs] = useState<TabEntry[]>(initialTabs);

  // Sync internal state when modal opens with new initial data
  useEffect(() => {
    if (isOpen) {
      setTabs(initialTabs.length > 0 ? initialTabs : [{ id: "", name: "", isNew: true }]);
    }
  }, [isOpen, initialTabs]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleNameChange = (index: number, name: string) => {
    setTabs((prev) =>
      prev.map((tab, i) =>
        i === index ? { ...tab, name } : tab
      )
    );
  };

  const handleRemoveTab = (index: number) => {
    setTabs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddNewTab = () => {
    setTabs((prev) => [
      ...prev,
      { id: `tab-${Date.now()}`, name: "", isNew: true },
    ]);
  };

  const handleClearInput = (index: number) => {
    handleNameChange(index, "");
  };

  const handleSave = () => {
    // Filter out empty tabs that are not pre-existing
    const validTabs = tabs.filter(
      (tab) => tab.name.trim() !== "" || !tab.isNew
    );
    onSave(validTabs.map((tab) => ({ ...tab, isNew: undefined })));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="manage-tabs-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal container */}
      <div
        ref={modalRef}
        className="relative w-full max-w-lg mx-4 bg-white dark:bg-dark-900 rounded-lg shadow-2xl border border-gray-200 dark:border-dark-700 flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-dark-700">
          <h2
            id="manage-tabs-title"
            className="text-base font-semibold text-gray-900 dark:text-gray-100"
          >
            {t("manageTabs.title")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors cursor-pointer"
            aria-label={t("common.close")}
          >
            <Icon name={"x" as never} size={18} />
          </button>
        </div>

        {/* Tab list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {tabs.map((tab, index) => (
            <div key={tab.id || index} className="flex items-center gap-2">
              {/* Drag handle */}
              <span className="text-gray-400 dark:text-gray-500 cursor-grab select-none flex-shrink-0 pt-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </span>

              {/* Name input */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={tab.name}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  placeholder={
                    tab.isNew && tab.name === ""
                      ? t("manageTabs.enterTabName")
                      : ""
                  }
                  className="w-full px-3 py-2 pr-8 text-sm rounded-md border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                  autoFocus={tab.isNew && tab.name === ""}
                />
                {tab.name && (
                  <button
                    type="button"
                    onClick={() => handleClearInput(index)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
                    aria-label={t("common.clear")}
                  >
                    <Icon name={"x" as never} size={14} />
                  </button>
                )}
              </div>

              {/* Delete/trash button */}
              <button
                type="button"
                onClick={() => handleRemoveTab(index)}
                className="p-2 rounded-md text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0 cursor-pointer"
                aria-label={t("manageTabs.deleteTab")}
              >
                <Icon name={"trash-2" as never} size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-200 dark:border-dark-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddNewTab}
            className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium"
          >
            {t("manageTabs.addNewTab")}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
            >
              {t("common.save")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageTabsModal;
