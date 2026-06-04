import type { AgentConnection } from "../../types/ai";
import "./AgentSelector.css";

interface AgentSelectorProps {
  agents: AgentConnection[];
  selectedAgent: AgentConnection | null;
  onSelect: (agent: AgentConnection) => void;
  onRefresh?: () => void;
}

export function AgentSelector({
  agents,
  selectedAgent,
  onSelect,
  onRefresh,
}: AgentSelectorProps) {
  if (agents.length === 0) {
    return (
      <div className="agent-selector agent-selector--empty">
        <div className="agent-selector__no-agents">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="agent-selector__icon"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          <span>No agent configured</span>
        </div>
      </div>
    );
  }

  return (
    <div className="agent-selector">
      <select
        value={selectedAgent?.id || ""}
        onChange={(e) => {
          const agent = agents.find((a) => a.id === e.target.value);
          if (agent) {
            onSelect(agent);
          }
        }}
        className="agent-selector__dropdown"
        aria-label="Select agent"
      >
        {agents.map((agent) => (
          <option key={agent.id} value={agent.id}>
            {agent.name}
          </option>
        ))}
      </select>

      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          className="agent-selector__refresh-btn"
          title="Refresh agents"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M23 4v6h-6M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </button>
      )}

      <div className="agent-selector__status">
        <span
          className={`agent-selector__status-dot agent-selector__status-dot--${selectedAgent?.status || "disconnected"}`}
        />
      </div>
    </div>
  );
}
