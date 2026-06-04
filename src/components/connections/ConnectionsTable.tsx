import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Icon } from "@openbb/ui";
import { connectionService } from "../../services/connections/connectionService";
import type { Connection } from "../../types/connections";
import StatusIndicator from "./StatusIndicator";

interface ConnectionsTableProps {
  connections: Connection[];
  onEdit: (connection: Connection) => void;
  onDelete: (connection: Connection) => void;
  onRefresh: () => void;
}

function ConnectionsTable({
  connections,
  onEdit,
  onDelete,
  onRefresh,
}: ConnectionsTableProps): JSX.Element {
  const { t } = useTranslation();
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  const handleRefresh = async (id: string) => {
    setRefreshingId(id);
    try {
      await connectionService.refreshConnection(id);
      onRefresh();
    } finally {
      setRefreshingId(null);
    }
  };

  if (connections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-500">
        <svg
          className="w-16 h-16 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p>{t("connections.noConnections")}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
              {t("connections.status")}
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
              {t("connections.name")}
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
              {t("connections.lastActivity")}
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
              {t("connections.metrics")}
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
              {t("connections.actions")}
            </th>
          </tr>
        </thead>
        <tbody>
          {connections.map((connection) => (
            <tr
              key={connection.id}
              className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              <td className="py-3 px-4">
                <StatusIndicator status={connection.status} />
              </td>
              <td className="py-3 px-4">
                <div className="font-medium dark:text-white">
                  {connection.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {connection.url}
                </div>
              </td>
              <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                {new Date(connection.lastActivity).toLocaleString()}
              </td>
              <td className="py-3 px-4">
                <div className="flex space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>
                    {t("connections.apps")}: {connection.metrics.apps}
                  </span>
                  <span>
                    {t("connections.widgets")}: {connection.metrics.widgets}
                  </span>
                  <span>
                    {t("connections.agents")}: {connection.metrics.agents}
                  </span>
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon
                    onClick={() => onEdit(connection)}
                    title={t("connections.edit")}
                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    <Icon name={"edit" as never} size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon
                    onClick={() => handleRefresh(connection.id)}
                    disabled={refreshingId === connection.id}
                    title={t("connections.refresh")}
                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    <Icon name={"refresh-right" as never} size={16} className={refreshingId === connection.id ? "animate-spin" : ""} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon
                    onClick={() => onDelete(connection)}
                    title={t("connections.delete")}
                    className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Icon name={"trash" as never} size={16} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ConnectionsTable;
