import { Icon } from "@openbb/ui";
import { cn } from "../../utils/cn";

interface Tab {
  id: string;
  name: string;
}

interface NavigationBarProps {
  tabs: Tab[];
  activeTab: string;
  dashboardId?: string;
  onTabChange?: (tabId: string) => void;
  onEditTabs?: () => void;
  className?: string;
}

export function NavigationBar({
  tabs,
  activeTab,
  onTabChange,
  onEditTabs,
  className,
}: NavigationBarProps): JSX.Element {
  return (
    <div
      className={cn(
        "flex items-center justify-between h-11 px-4 border-b",
        "bg-gray-100 dark:bg-dark-900",
        "border-gray-200 dark:border-dark-700",
        className
      )}
    >
      {/* Tab list */}
      <div className="flex items-center gap-1 overflow-x-auto flex-1 min-w-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange?.(tab.id)}
              className={cn(
                "relative px-3 py-1.5 text-sm whitespace-nowrap transition-colors",
                "rounded-md cursor-pointer select-none",
                isActive
                  ? "text-gray-900 dark:text-gray-100 font-semibold bg-white dark:bg-dark-800 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 font-medium hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-dark-800/50"
              )}
            >
              {tab.name}
              {isActive && (
                <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-blue-500 dark:bg-blue-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Action icons */}
      <div className="flex items-center gap-1 ml-3 flex-shrink-0">
        <button
          type="button"
          onClick={onEditTabs}
          className="p-1.5 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-800 transition-colors cursor-pointer"
          title="Manage tabs"
          aria-label="Manage tabs"
        >
          <Icon name={"edit" as never} size={16} />
        </button>
        <button
          type="button"
          className="p-1.5 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-800 transition-colors cursor-pointer"
          title="Close"
          aria-label="Close"
        >
          <Icon name={"x" as never} size={16} />
        </button>
      </div>
    </div>
  );
}

export default NavigationBar;
