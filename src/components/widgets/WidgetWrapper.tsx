import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface WidgetWrapperProps {
  children: ReactNode;
  isLoading?: boolean;
  footer?: ReactNode;
  onRefresh?: () => void;
}

export function WidgetWrapper({
  children,
  isLoading = false,
  footer,
  onRefresh: _onRefresh,
}: WidgetWrapperProps): JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-dark-900 rounded-lg shadow-sm overflow-hidden">
      <div className="flex-1 overflow-auto min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            {t("common.loading")}
          </div>
        ) : (
          children
        )}
      </div>

      {footer && (
        <div className="border-t border-gray-200 dark:border-dark-700 p-2">
          {footer}
        </div>
      )}
    </div>
  );
}

export default WidgetWrapper;
