import { useEffect, useRef, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button, Icon, Select } from "@openbb/ui";
import { useAgent } from "../../hooks/useAgent";
import type { Message, AgentConnection } from "../../types/ai";
import { sessionManager, type Session } from "../../services/ai/sessionManager";
import "./AIAssistant.css";

interface AIAssistantProps {
  onClose: () => void;
  onToggleExpand: () => void;
  isExpanded: boolean;
}

function WelcomeMessage() {
  return (
    <div className="copilot-welcome">
      <div className="copilot-welcome-icon">
        <Icon name={"info-outline-circle" as never} size={48} />
      </div>
      <h3 className="copilot-welcome-title">OpenBB Copilot</h3>
      <div className="copilot-welcome-sections">
        <div className="copilot-welcome-section">
          <div className="copilot-welcome-section-title">Widgets</div>
          <div className="copilot-welcome-section-content">
            Click <Icon name={"plus" as never} size={14} className="copilot-inline-icon" /> on a widget to add it as explicit context.
          </div>
        </div>
        <div className="copilot-welcome-section">
          <div className="copilot-welcome-section-title">Chat Input Area</div>
          <div className="copilot-welcome-section-content">
            Use the <strong>@</strong> button to select widgets directly from the AI panel, or simply type <strong>@widget_name</strong>.
          </div>
        </div>
        <div className="copilot-welcome-section">
          <div className="copilot-welcome-section-title">Chat Settings</div>
          <div className="copilot-welcome-section-content">
            Activate Global data access to expand the AI's knowledge scope beyond your workspace data.
          </div>
        </div>
      </div>
    </div>
  );
}

function renderMessageContent(message: Message): React.ReactNode {
  if (message.isReasoning) {
    const typeClass = `reasoning-${message.reasoningType?.toLowerCase() || "info"}`;
    return (
      <div className={`message-reasoning ${typeClass}`}>
        <div className="reasoning-header">
          <span className={`reasoning-badge ${typeClass}`}>
            {message.reasoningType || "INFO"}
          </span>
          <Icon name={"chevron-right" as never} size={14} />
        </div>
        <div className="reasoning-content">
          {message.content || "No reasoning content"}
        </div>
      </div>
    );
  }

  if (message.role === "user") {
    return <div className="message-text">{message.content || "Empty message"}</div>;
  }

  const content = message.content || "*No response content*";

  const isMarkdown = !message.metadata?.type || message.metadata.type === "markdown";

  if (!isMarkdown) {
    return <div className="message-text">{content}</div>;
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          const isInline = !match;

          if (isInline) {
            return <code className="inline-code" {...props}>{children}</code>;
          }

          return (
            <pre className="code-block">
              <code className={className} {...props}>
                {children}
              </code>
            </pre>
          );
        },
        a({ children, href, ...props }) {
          return (
            <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
              {children}
            </a>
          );
        },
        p({ children }) {
          return <p className="message-paragraph">{children}</p>;
        },
        ul({ children }) {
          return <ul className="message-list">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="message-list">{children}</ol>;
        },
        li({ children }) {
          return <li className="message-list-item">{children}</li>;
        },
        blockquote({ children }) {
          return <blockquote className="message-blockquote">{children}</blockquote>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

function ChatHistoryDropdown({ 
  isOpen, 
  onClose, 
  chats, 
  onSelectChat,
  onDeleteChat 
}: { 
  isOpen: boolean;
  onClose: () => void;
  chats: Session[];
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}) {
  if (!isOpen) return null;

  const groupedChats = useMemo(() => {
    const groups: Record<string, Session[]> = {};
    chats.forEach((chat) => {
      const dateKey = chat.lastActivityAt.toLocaleDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(chat);
    });
    return groups;
  }, [chats]);

  const sortedDateKeys = useMemo(() => {
    return Object.keys(groupedChats).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );
  }, [groupedChats]);

  return (
    <div className="chat-history-dropdown">
      <div className="chat-history-search">
        <Icon name={"search" as never} size={14} className="chat-history-search-icon" />
        <input
          type="text"
          placeholder="Search chats"
          className="chat-history-search-input"
        />
      </div>
      <div className="chat-history-list">
        {sortedDateKeys.map((dateKey) => (
          <div key={dateKey} className="chat-history-group">
            <div className="chat-history-group-header">
              <Icon name={"chevron-right" as never} size={10} className="chat-history-group-arrow" />
              <span className="chat-history-group-label">{dateKey}</span>
            </div>
            <div className="chat-history-group-items">
              {groupedChats[dateKey].map((chat) => (
                <div
                  key={chat.id}
                  className="chat-history-item"
                  onClick={() => {
                    onSelectChat(chat.id);
                    onClose();
                  }}
                >
                  <span className="chat-history-item-title">{sessionManager.getSessionTitle(chat)}</span>
                  <div className="chat-history-item-actions">
                    <span 
                      className="chat-history-item-action-btn" 
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("Edit chat:", chat.id);
                      }}
                      title="Edit"
                    >
                      <Icon name={"edit-03" as never} size={14} />
                    </span>
                    <span 
                      className="chat-history-item-action-btn" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(chat.id);
                      }}
                      title="Delete"
                    >
                      <Icon name={"x-outline-circle" as never} size={14} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AIAssistant({ onClose, onToggleExpand, isExpanded }: AIAssistantProps) {
  useTranslation("ai");
  const {
    messages,
    isLoading,
    isStreaming,
    error,
    selectedAgent,
    availableAgents,
    sendMessage,
    clearMessages,
    selectAgent,
    terminateProcess,
    setError,
    sessions,
    selectSession,
    deleteSession,
    newSession,
  } = useAgent();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [showChatHistory, setShowChatHistory] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const handleSendMessage = async () => {
    if (!inputRef.current || !inputRef.current.value.trim()) return;

    const content = inputRef.current.value;
    inputRef.current.value = "";

    if (selectedAgent) {
      await sendMessage(content);
    } else {
      setError("No agent configured. Please select an agent from the dropdown or configure one in the Connections page.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewChat = () => {
    newSession();
  };

  const handleClearChat = () => {
    clearMessages();
  };

  const handleStopGeneration = async () => {
    await terminateProcess();
  };

  const handleSelectAgent = (agent: AgentConnection) => {
    selectAgent(agent);
  };

  const handleSelectChat = (chatId: string) => {
    selectSession(chatId);
  };

  const handleDeleteChat = (chatId: string) => {
    deleteSession(chatId);
  };

  const hasMessages = messages.length > 0;

  const agentOptions = availableAgents.map((agent) => ({
    value: agent.id,
    label: agent.name,
  }));

  return (
    <div className={`copilot ${isExpanded ? "copilot--expanded" : ""}`}>
      {/* Header */}
      <div className="copilot-header" id="obb-copilot-header">
        <div className="copilot-header-left">
          {/* Chat History Button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowChatHistory(!showChatHistory)}
            className="copilot-chat-history-btn"
          >
            <span className="copilot-chat-history-title">New Chat</span>
            <span className="copilot-chat-history-count">({sessions.length})</span>
            <Icon name={showChatHistory ? "chevron-down" as never : "chevron-right" as never} size={14} />
          </Button>
          
          {/* Chat History Dropdown */}
          <ChatHistoryDropdown
            isOpen={showChatHistory}
            onClose={() => setShowChatHistory(false)}
            chats={sessions}
            onSelectChat={handleSelectChat}
            onDeleteChat={handleDeleteChat}
          />
        </div>
        <div className="copilot-header-buttons" id="obb-copilot-header-buttons">
          <Button variant="ghost" size="xs" onClick={handleNewChat} title="New Chat">
            <Icon name={"plus" as never} size={14} />
          </Button>
          <Button variant="ghost" size="xs" onClick={handleClearChat} title="Clear Chat">
            <Icon name={"trash-2" as never} size={14} />
          </Button>
          <Button variant="ghost" size="xs" onClick={onToggleExpand} title={isExpanded ? "Minimize" : "Maximize"}>
            {isExpanded ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={14} height={14}>
                <path d="M4 14h6v6M14 4h6v6M20 20l-6-6M4 4l6 6" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={14} height={14}>
                <path d="M15 3h6v6M9 21H3v-6M21 3l-6 6M3 21l6-6" />
              </svg>
            )}
          </Button>
          <Button variant="ghost" size="xs" onClick={onClose} title="Close">
            <Icon name={"x" as never} size={14} />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="copilot-messages" id="message-box">
        {!hasMessages && <WelcomeMessage />}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`copilot-message ${message.role === "user" ? "user" : "assistant"} ${message.isReasoning ? "reasoning" : ""}`}
          >
            {message.role !== "user" && !message.isReasoning && (
              <div className="message-agent-name">
                {selectedAgent?.name || "OpenBB Copilot"}
              </div>
            )}
            <div className="message-content">
              {renderMessageContent(message)}
            </div>
            {!message.isReasoning && (
              <div className="message-time">
                {message.timestamp.toLocaleTimeString()}
              </div>
            )}
            {message.role === "user" && !message.isReasoning && (
              <div className="message-actions">
                <Button variant="ghost" size="xs" title="Add to prompts">
                  <Icon name={"prompt-add" as never} size={12} />
                </Button>
                <Button variant="ghost" size="xs" title="Edit">
                  <Icon name={"pencil" as never} size={12} />
                </Button>
                <Button variant="ghost" size="xs" title="Repeat">
                  <Icon name={"repeat-04" as never} size={12} />
                </Button>
              </div>
            )}
          </div>
        ))}

        {(isLoading || isStreaming) && (
          <div className="copilot-message assistant">
            <div className="message-content">
              <div className="loading-indicator">
                <span className="loading-dot"></span>
                <span className="loading-dot"></span>
                <span className="loading-dot"></span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="copilot-message assistant error">
            <div className="message-content">
              <div className="error-message">
                <Icon name={"alert-circle" as never} size={16} className="error-icon" />
                <span>{error}</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Toolbar */}
      <div className="copilot-toolbar">
        <div className="copilot-toolbar-left">
          <Button 
            variant="ghost" 
            size="xs" 
            title="Copilot settings"
          >
            <Icon name={"settings-01" as never} size={16} />
          </Button>
          <div className="copilot-toolbar-divider" />
          <div className="copilot-toolbar-mcp">
            <Button variant="ghost" size="xs" title="MCP Tools">
              <Icon name={"wrench" as never} size={16} />
            </Button>
            <span className="copilot-toolbar-mcp-count">0</span>
          </div>
          <div className="copilot-toolbar-divider" />
          <Button variant="ghost" size="xs" title="Add widget">
            <span className="copilot-toolbar-at">@</span>
          </Button>
          <span className="copilot-toolbar-context">Using dashboard widgets</span>
        </div>
      </div>

      {/* Input Area */}
      <div className="copilot-input-area" id="copilot-chat-footer">
        <textarea
          ref={inputRef}
          onKeyPress={handleKeyPress}
          placeholder={selectedAgent ? "Ask a question..." : "Ask OpenBB Copilot..."}
          className="copilot-input"
          disabled={isLoading && !isStreaming}
          rows={1}
        />
        <div className="copilot-input-actions">
          <div className="copilot-input-left">
            {/* Agent Selector at bottom */}
            <Select
              value={selectedAgent?.id || ""}
              onChange={(value) => {
                const agent = availableAgents.find((a) => a.id === value);
                if (agent) {
                  handleSelectAgent(agent);
                }
              }}
              placeholder="Select Agent"
              size="xs"
              options={agentOptions}
            />
          </div>
          <div className="copilot-input-right">
            <Button variant="ghost" size="xs" title="Prompt suggestions">
              <Icon name={"lightbulb-02" as never} size={16} />
            </Button>
            <Button variant="ghost" size="xs" title="Attach files">
              <Icon name={"attachment-icon" as never} size={16} />
            </Button>
            <Button variant="ghost" size="xs" title="Generate prompt">
              <Icon name={"sparkles-icon" as never} size={16} />
            </Button>
            {(isLoading || isStreaming) ? (
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handleStopGeneration} 
                title="Stop generation"
              >
                <Icon name={"square" as never} size={16} />
              </Button>
            ) : (
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handleSendMessage} 
                title="Send message"
                disabled={!inputRef.current?.value.trim()}
              >
                <Icon name={"send" as never} size={16} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}