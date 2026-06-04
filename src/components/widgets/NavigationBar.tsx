import { Button } from "@openbb/ui";
import { cn } from "../../utils/cn";

interface Tab {
  id: string;
  name: string;
}

interface NavigationBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
}

export function NavigationBar({
  tabs,
  activeTab,
  onTabChange,
  className,
}: NavigationBarProps): JSX.Element {
  return (
    <div className={cn("bg-white dark:bg-dark-900 border-b border-light-200 dark:border-dark-500", className)}>
      <div className="flex items-center space-x-1 px-4 py-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "primary" : "ghost"}
            size="sm"
            onClick={() => onTabChange?.(tab.id)}
          >
            {tab.name}
          </Button>
        ))}
      </div>
    </div>
  );
}

export default NavigationBar;
