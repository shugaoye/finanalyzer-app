import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@openbb/ui";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  backendName: string;
  onClose: () => void;
  onDelete: () => void;
}

function DeleteConfirmationModal({
  isOpen,
  backendName,
  onClose,
  onDelete,
}: DeleteConfirmationModalProps): JSX.Element | null {
  const { t } = useTranslation();

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

  if (!isOpen) {
    return null;
  }

  return (
    <div ref={modalRootRef} className="modal-overlay">
      <div className="modal-content w-full max-w-md p-6">
        <div className="text-center mb-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t("connections.deleteConnection")}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("connections.deleteConfirmation").replace(
              "{backendName}",
              backendName,
            )}
          </p>
        </div>
        <div className="flex justify-end space-x-3">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            {t("common.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
          >
            {t("common.delete")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmationModal;
