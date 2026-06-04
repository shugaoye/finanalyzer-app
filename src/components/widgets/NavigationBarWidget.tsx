import { Button } from "@openbb/ui";
import { useState } from "react";
import type { WidgetInstanceProps } from "../../types/widgets";
import { WidgetWrapper } from "./WidgetWrapper";
import { NavigationBar } from "./NavigationBar";

interface NavigationTab {
  id: string;
  name: string;
}

export function NavigationBarWidget({ widget, onRefresh }: WidgetInstanceProps): JSX.Element {
  const tabs = (widget.data as { tabs?: NavigationTab[] })?.tabs || [];
  const [activeTab, setActiveTab] = useState(tabs.length > 0 ? tabs[0].id : "");

  if (tabs.length === 0) {
    return (
      <WidgetWrapper isLoading={false} onRefresh={onRefresh}>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4 text-light-900 dark:text-white">
            Navigation Bar
          </h3>
          <p className="text-light-600 dark:text-dark-50 mb-4">
            Configure tabs in the widget settings to enable navigation.
          </p>
          <Button variant="primary" size="sm" disabled>
            Configure Tabs
          </Button>
        </div>
      </WidgetWrapper>
    );
  }

  return (
    <WidgetWrapper isLoading={false} onRefresh={onRefresh}>
      <NavigationBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <div className="p-4">
        <p className="text-sm text-light-600 dark:text-dark-50">
          Active tab: {tabs.find((t) => t.id === activeTab)?.name || activeTab}
        </p>
      </div>
    </WidgetWrapper>
  );
}

export default NavigationBarWidget;
