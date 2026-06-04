import { useTranslation } from "react-i18next";
import { Input, Select } from "@openbb/ui";

interface SearchFilterBarProps {
  searchTerm: string;
  onSearch: (searchTerm: string) => void;
  statusFilter: "All" | "connected" | "disconnected" | "testing" | "error";
  onStatusFilter: (
    status: "All" | "connected" | "disconnected" | "testing" | "error",
  ) => void;
  sortBy: "Name" | "Activity";
  onSort: (sortBy: "Name" | "Activity") => void;
}

function SearchFilterBar({
  searchTerm,
  onSearch,
  statusFilter,
  onStatusFilter,
  sortBy,
  onSort,
}: SearchFilterBarProps): JSX.Element {
  const { t } = useTranslation();

  const handleSearchChange = (value: any) => {
    onSearch(String(value));
  };

  const handleStatusChange = (value: string) => {
    onStatusFilter(
      value as
        | "All"
        | "connected"
        | "disconnected"
        | "testing"
        | "error",
    );
  };

  const handleSortChange = (value: string) => {
    onSort(value as "Name" | "Activity");
  };

  return (
    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg mb-4 dark:bg-gray-800">
      <div className="flex-1">
        <Input
          type="text"
          placeholder={t("connections.search")}
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      <div className="w-40">
        <Select
          value={statusFilter}
          onChange={handleStatusChange}
          options={[
            { value: "All", label: t("connections.statusAll") },
            { value: "connected", label: t("connections.connected") },
            { value: "disconnected", label: t("connections.disconnected") },
            { value: "testing", label: t("connections.testing") },
            { value: "error", label: t("connections.error") },
          ]}
          className="text-gray-900"
        />
      </div>
      <div className="w-40">
        <Select
          value={sortBy}
          onChange={handleSortChange}
          options={[
            { value: "Name", label: t("connections.sortByName") },
            { value: "Activity", label: t("connections.sortByActivity") },
          ]}
          className="text-gray-900"
        />
      </div>
    </div>
  );
}

export default SearchFilterBar;
