import { Button, Icon } from "@openbb/ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { WidgetConfig } from "../../services/widgets/widgetService";

interface WidgetMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWidgets: (widgets: WidgetConfig[]) => void;
  widgets: WidgetConfig[];
  loading?: boolean;
}

interface CategoryGroup {
  name: string;
  subcategories: { name: string; count: number }[];
  widgets: WidgetConfig[];
}

function WidgetMenuModal({
  isOpen,
  onClose,
  onAddWidgets,
  widgets,
  loading = false,
}: WidgetMenuModalProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedWidgets, setSelectedWidgets] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["All"]),
  );
  const [activeTab, setActiveTab] = useState<"widgets" | "data">("widgets");
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

  const categories = useMemo(() => {
    const categoryMap = new Map<string, Map<string, WidgetConfig[]>>();

    widgets.forEach((widget) => {
      const category = widget.category || "Others";
      const subcategory = widget.subcategory || "General";

      if (!categoryMap.has(category)) {
        categoryMap.set(category, new Map());
      }
      const subcatMap = categoryMap.get(category)!;
      if (!subcatMap.has(subcategory)) {
        subcatMap.set(subcategory, []);
      }
      subcatMap.get(subcategory)!.push(widget);
    });

    return categoryMap;
  }, [widgets]);

  const categoryList = useMemo(() => {
    return Array.from(categories.keys()).sort();
  }, [categories]);

  const filteredAndGroupedWidgets = useMemo(() => {
    const groups: CategoryGroup[] = [];

    categories.forEach((subcatMap, category) => {
      if (selectedCategory !== "All" && category !== selectedCategory) {
        return;
      }

      const subcategories: { name: string; count: number }[] = [];
      const allWidgets: WidgetConfig[] = [];

      subcatMap.forEach((widgetList, subcat) => {
        const filtered = widgetList.filter((w) => {
          const matchesSearch =
            searchQuery === "" ||
            w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            w.id.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesSearch;
        });

        if (filtered.length > 0) {
          subcategories.push({ name: subcat, count: filtered.length });
          allWidgets.push(...filtered);
        }
      });

      if (subcategories.length > 0) {
        groups.push({
          name: category,
          subcategories,
          widgets: allWidgets,
        });
      }
    });

    return groups;
  }, [categories, selectedCategory, searchQuery]);

  const handleToggleWidget = useCallback((widgetId: string) => {
    setSelectedWidgets((prev) => {
      const next = new Set(prev);
      if (next.has(widgetId)) {
        next.delete(widgetId);
      } else {
        next.add(widgetId);
      }
      return next;
    });
  }, []);

  const handleToggleCategory = useCallback((category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }, []);

  const handleSelectAllInCategory = useCallback(
    (category: string) => {
      const categoryWidgets = filteredAndGroupedWidgets.find(
        (g) => g.name === category,
      );
      if (!categoryWidgets) return;

      const allSelected = categoryWidgets.widgets.every((w) =>
        selectedWidgets.has(w.id),
      );

      setSelectedWidgets((prev) => {
        const next = new Set(prev);
        categoryWidgets.widgets.forEach((w) => {
          if (allSelected) {
            next.delete(w.id);
          } else {
            next.add(w.id);
          }
        });
        return next;
      });
    },
    [filteredAndGroupedWidgets, selectedWidgets],
  );

  const handleAdd = useCallback(() => {
    const widgetsToAdd = widgets.filter((w) => selectedWidgets.has(w.id));
    onAddWidgets(widgetsToAdd);
    onClose();
  }, [widgets, selectedWidgets, onAddWidgets, onClose]);

  const handleClose = useCallback(() => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedWidgets(new Set());
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div ref={modalRootRef} className="modal-overlay">
      <div className="modal-content bg-white dark:bg-dark-900 w-full max-w-[90vw] sm:max-w-[90vw] md:max-w-[95vw] lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl h-[90vh] sm:h-[80vh] md:h-[70vh] lg:h-[800px] max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-600">
          <h2 className="text-gray-900 dark:text-white font-semibold">
            {t("widgetMenu.title")}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-5 w-5 p-0 text-gray-500 dark:text-gray-400"
          >
            <Icon name={"x" as never} size={20} />
          </Button>
        </div>

        <div className="flex gap-2 mb-4 bg-gray-100 dark:bg-dark-800 rounded p-1">
          <button
            type="button"
            onClick={() => setActiveTab("widgets")}
            className={`inline-flex items-center justify-center gap-2 h-6 text-xs px-2.5 py-[7px] rounded transition whitespace-nowrap ${
              activeTab === "widgets"
                ? "bg-tab-bg-primary text-tab-action-active font-medium"
                : "text-tab-filled-secondary-text hover:bg-tab-filled-secondary-bg-hover"
            }`}
          >
            <svg id="grid-01" className="size-4">
              <use href="/assets/icons/sprite.svg?v=v3.5.0#grid-01" />
            </svg>
            <span>{t("widgetMenu.widgetsLibrary")}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("data")}
            className={`inline-flex items-center justify-center gap-2 h-6 text-xs px-2.5 py-[7px] rounded transition whitespace-nowrap ${
              activeTab === "data"
                ? "bg-tab-bg-primary text-tab-action-active font-medium"
                : "text-tab-filled-secondary-text hover:bg-tab-filled-secondary-bg-hover"
            }`}
          >
            <svg id="database-01" className="size-4">
              <use href="/assets/icons/sprite.svg?v=v3.5.0#database-01" />
            </svg>
            <span>{t("widgetMenu.data")}</span>
          </button>
        </div>

        {activeTab === "widgets" && (
          <div className="flex flex-1 min-h-0 gap-2.5 overflow-hidden">
            <div className="sm:min-w-[180px] sm:max-w-[200px] p-2.5 flex flex-col border-r border-surface-divider overflow-y-auto">
              <button
                type="button"
                onClick={() => setSelectedCategory("All")}
                className={`w-full text-left body-xs-regular p-2.5 transition rounded capitalize cursor-pointer ${
                  selectedCategory === "All"
                    ? "bg-general-bg-secondary-hover font-medium"
                    : "hover:bg-general-bg-primary-hover"
                }`}
              >
                All
              </button>
              {categoryList.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full text-left body-xs-regular p-2.5 transition rounded capitalize cursor-pointer ${
                    selectedCategory === category
                      ? "bg-general-bg-secondary-hover font-medium"
                      : "hover:bg-general-bg-primary-hover"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex flex-shrink-0 gap-2 sm:justify-between p-2.5 border-b border-surface-divider">
                <div className="flex items-center gap-2">
                  <div className="relative h-full min-w-[3rem] flex-1">
                    <input
                      type="text"
                      className="peer w-full border-none bg-transparent file:border-0 file:bg-transparent file:font-medium file:text-sm py-1 pl-8 text-general-label placeholder:text-ds-text-caption focus:outline-none"
                      placeholder={t("widgetMenu.searchPlaceholder")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <svg
                      id="search"
                      className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-ds-text-body"
                    >
                      <use href="/assets/icons/sprite.svg?v=v3.5.0#search" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto p-2.5">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-ds-text-body">{t("common.loading")}</p>
                  </div>
                ) : filteredAndGroupedWidgets.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-ds-text-body">
                      {t("widgetMenu.noWidgetsFound")}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {filteredAndGroupedWidgets.map((group) => (
                      <div key={group.name}>
                        <div className="flex items-center gap-2 pr-2.5 mb-2">
                          <button
                            type="button"
                            onClick={() => handleToggleCategory(group.name)}
                            className="flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            <svg
                              id="chevron-right"
                              className={`size-4 min-w-4 cursor-pointer transition-transform duration-300 ${expandedCategories.has(group.name) ? "rotate-90" : ""}`}
                              fill="currentColor"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path d="M9 18l6-6-6-6" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectAllInCategory(group.name)}
                            className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${group.widgets.every((w) => selectedWidgets.has(w.id)) ? "bg-white border-gray-300" : "border-gray-300 bg-transparent"}`}
                          >
                            {group.widgets.every((w) => selectedWidgets.has(w.id)) && (
                              <svg id="check" className="size-3 text-black" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                              </svg>
                            )}
                          </button>
                          <div className="flex items-center gap-2 cursor-pointer flex-1">
                            <p className="body-xs-medium text-ds-text-heading capitalize">
                              {group.name.toLowerCase()} (
                              {group.subcategories.reduce((a, b) => a + b.count, 0)})
                            </p>
                          </div>
                        </div>

                        {expandedCategories.has(group.name) && (
                          <div className="flex flex-col gap-1">
                            {group.subcategories.map((subcat) => (
                              <div key={subcat.name}>
                                <div className="flex items-center gap-2 pr-2.5 pl-4 py-2">
                                  <svg
                                    id="chevron-right"
                                    className="size-3 min-w-3 cursor-pointer transition-transform duration-300 rotate-90 text-gray-500 dark:text-gray-400"
                                    fill="currentColor"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M9 18l6-6-6-6" />
                                  </svg>
                                  <div className="flex items-center gap-2 cursor-pointer flex-1">
                                    <p className="body-xs-regular text-ds-text-subtitle capitalize">
                                      {subcat.name.toLowerCase()} ({subcat.count})
                                    </p>
                                  </div>
                                </div>
                                <div className="pl-[26px] pb-2.5">
                                  {group.widgets
                                    .filter((w) =>
                                      subcat.name === "General"
                                        ? !w.subcategory || w.subcategory === "General"
                                        : w.subcategory === subcat.name
                                    )
                                    .map((widget) => (
                                      <div
                                        key={widget.id}
                                        onClick={() => handleToggleWidget(widget.id)}
                                        className="w-full px-2.5 py-[7px] flex items-center gap-2.5 rounded bg-search-widget-bg cursor-pointer hover:bg-search-widget-bg-hover mb-1 last:mb-0"
                                      >
                                        <div className="w-4 h-4">
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleToggleWidget(widget.id);
                                            }}
                                            className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${selectedWidgets.has(widget.id) ? "bg-white border-gray-300" : "border-gray-300 bg-transparent"}`}
                                          >
                                            {selectedWidgets.has(widget.id) && (
                                              <svg
                                                id="check"
                                                className="size-3 text-black"
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                              </svg>
                                            )}
                                          </button>
                                        </div>
                                        <div className="flex gap-2.5 justify-between w-full items-center min-w-0">
                                          <p className="whitespace-nowrap capitalize truncate">
                                            {widget.name}
                                          </p>
                                          <div className="flex items-center gap-2 ml-auto flex-shrink-0">
                                            <span className="text-xs text-ds-text-caption capitalize whitespace-nowrap block sm:hidden">
                                              {group.name.toLowerCase()} ·{" "}
                                              {subcat.name.toLowerCase()}
                                            </span>
                                            {widget.source && (
                                              <span className="text-ds-text-caption capitalize body-xs-regular whitespace-nowrap">
                                                {widget.source}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "data" && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-ds-text-body">{t("widgetMenu.dataComingSoon")}</p>
          </div>
        )}

        <div className="flex items-center gap-2.5 mt-auto pt-4 border-t border-surface-divider">
          <div className="flex gap-2.5 ml-auto">
            <Button variant="outlined" size="sm" onClick={handleClose}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAdd}
              disabled={selectedWidgets.size === 0}
            >
              {t("widgetMenu.addWidgets")} ({selectedWidgets.size})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WidgetMenuModal;