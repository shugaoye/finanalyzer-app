import { useState, useCallback, useEffect, useRef } from "react";
import type {
  Message,
  AgentConnection,
  WidgetInfo,
  ReasoningStep,
  MessageChunk,
} from "../types/ai";
import {
  sendQuery,
  getAvailableAgentConnections,
  terminateProcess,
} from "../services/ai/agentService";
import { buildQueryRequest } from "../services/ai/queryBuilder";
import { sessionManager, type Session } from "../services/ai/sessionManager";

export function useAgent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentConnection | null>(null);
  const [availableAgents, setAvailableAgents] = useState<AgentConnection[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const refreshAgents = useCallback(async () => {
    const agents = await getAvailableAgentConnections();
    setAvailableAgents(agents);

    if (agents.length > 0 && !selectedAgent) {
      setSelectedAgent(agents[0]);
    }
  }, [selectedAgent]);

  const refreshSessions = useCallback(() => {
    const allSessions = sessionManager.getRecentSessions(50);
    setSessions(allSessions);
    const current = sessionManager.getCurrentSession();
    setCurrentSession(current || null);
  }, []);

  useEffect(() => {
    refreshAgents();
    refreshSessions();
  }, [refreshAgents, refreshSessions]);

  const selectAgent = useCallback((agent: AgentConnection) => {
    setSelectedAgent(agent);
    const session = sessionManager.getOrCreateSession(agent.id);
    setMessages(session.messages);
    setError(null);
    refreshSessions();
  }, [refreshSessions]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    sessionManager.resetCurrentSession();
    refreshSessions();
  }, [refreshSessions]);

  const selectSession = useCallback((sessionId: string) => {
    const session = sessionManager.getSession(sessionId);
    if (session) {
      sessionManager.setCurrentSession(sessionId);
      setCurrentSession(session);
      setMessages(session.messages);
      setError(null);
    }
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    sessionManager.deleteSession(sessionId);
    refreshSessions();
    const current = sessionManager.getCurrentSession();
    if (current) {
      setCurrentSession(current);
      setMessages(current.messages);
    } else {
      setCurrentSession(null);
      setMessages([]);
    }
  }, [refreshSessions]);

  const newSession = useCallback(() => {
    if (selectedAgent) {
      sessionManager.createSession(selectedAgent.id);
      setMessages([]);
      setError(null);
      refreshSessions();
    }
  }, [selectedAgent, refreshSessions]);

  const terminateCurrentProcess = useCallback(async () => {
    if (selectedAgent) {
      try {
        await terminateProcess(selectedAgent);
      } catch {
        console.warn("Failed to terminate agent process");
      }
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setIsLoading(false);
    setIsStreaming(false);
  }, [selectedAgent]);

  const sendMessage = useCallback(
    async (content: string, widgets?: WidgetInfo[]) => {
      if (!selectedAgent) {
        setError("No agent selected");
        return;
      }

      if (!content.trim()) {
        return;
      }

      setIsLoading(true);
      setIsStreaming(true);
      setError(null);

      abortControllerRef.current = new AbortController();

      const userMessage: Message = {
        id: `user_${Date.now()}`,
        content,
        role: "user",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);

      try {
        const session = sessionManager.getOrCreateSession(selectedAgent.id);
        const history = session.messages;

        const request = buildQueryRequest(content, history, widgets);

        const assistantMessageId = `assistant_${Date.now()}`;
        let currentContent = "";

        setMessages((prev) => [
          ...prev,
          {
            id: assistantMessageId,
            content: "",
            role: "assistant",
            timestamp: new Date(),
          },
        ]);

        for await (const event of sendQuery(selectedAgent, request)) {
          if (abortControllerRef.current?.signal.aborted) {
            break;
          }

          console.debug("Received agent event:", event.type, event.data);

          if (event.type === "reasoning_step") {
            const reasoning = event.data as ReasoningStep;
            console.debug("Processing reasoning step:", reasoning);

            const reasoningMessage: Message = {
              id: `reasoning_${Date.now()}_${Math.random()}`,
              content: reasoning.message,
              role: "assistant",
              timestamp: new Date(),
              isReasoning: true,
              reasoningType: reasoning.event_type,
              reasoningDetails: reasoning.details,
            };

            setMessages((prev) => [...prev, reasoningMessage]);
          } else if (event.type === "message_chunk") {
            const chunk = event.data as MessageChunk;
            console.debug("Processing message chunk:", chunk.content);
            currentContent += chunk.content;
            console.debug("Current content:", currentContent);

            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, content: currentContent }
                  : msg,
              ),
            );
          }
        }

        sessionManager.addMessage(session.id, userMessage);
        sessionManager.addMessage(session.id, {
          id: assistantMessageId,
          content: currentContent,
          role: "assistant",
          timestamp: new Date(),
        });
        refreshSessions();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);

        const errorMsg: Message = {
          id: `error_${Date.now()}`,
          content: `Error: ${errorMessage}`,
          role: "assistant",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [selectedAgent, refreshSessions],
  );

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    messages,
    isLoading,
    isStreaming,
    error,
    selectedAgent,
    availableAgents,
    sendMessage,
    clearMessages,
    selectAgent,
    terminateProcess: terminateCurrentProcess,
    refreshAgents,
    setError,
    sessions,
    currentSession,
    selectSession,
    deleteSession,
    newSession,
  };
}
