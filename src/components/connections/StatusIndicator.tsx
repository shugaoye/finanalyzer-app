import { useTranslation } from "react-i18next";
import { Tag } from "@openbb/ui";

interface StatusIndicatorProps {
  status: "connected" | "disconnected" | "testing" | "error";
}

function StatusIndicator({ status }: StatusIndicatorProps): JSX.Element {
  const { t } = useTranslation();

  const statusConfig = {
    connected: {
      color: "success" as const,
      label: t("connections.connected"),
    },
    disconnected: {
      color: "ruby" as const,
      label: t("connections.disconnected"),
    },
    testing: {
      color: "warning" as const,
      label: t("connections.testing"),
    },
    error: {
      color: "warning" as const,
      label: t("connections.error"),
    },
  };

  const config = statusConfig[status];

  return (
    <Tag color={config.color}>
      {config.label}
    </Tag>
  );
}

export default StatusIndicator;
