import type { Message } from "../../types/ai";

export interface Session {
  id: string;
  agentId: string;
  messages: Message[];
  createdAt: Date;
  lastActivityAt: Date;
  isContinued: boolean;
}

class SessionManager {
  private sessions: Map<string, Session> = new Map();
  private currentSessionId: string | null = null;

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  createSession(agentId: string): Session {
    const id = this.generateSessionId();
    const session: Session = {
      id,
      agentId,
      messages: [],
      createdAt: new Date(),
      lastActivityAt: new Date(),
      isContinued: false,
    };

    this.sessions.set(id, session);
    this.currentSessionId = id;

    return session;
  }

  getSession(id: string): Session | undefined {
    return this.sessions.get(id);
  }

  getCurrentSession(): Session | undefined {
    if (!this.currentSessionId) {
      return undefined;
    }

    return this.sessions.get(this.currentSessionId);
  }

  setCurrentSession(id: string): void {
    if (this.sessions.has(id)) {
      this.currentSessionId = id;
    }
  }

  addMessage(sessionId: string, message: Message): void {
    const session = this.sessions.get(sessionId);

    if (session) {
      session.messages.push(message);
      session.lastActivityAt = new Date();
      session.isContinued = true;
    }
  }

  clearMessages(sessionId: string): void {
    const session = this.sessions.get(sessionId);

    if (session) {
      session.messages = [];
      session.isContinued = false;
    }
  }

  deleteSession(id: string): boolean {
    return this.sessions.delete(id);
  }

  clearAllSessions(): number {
    const count = this.sessions.size;
    this.sessions.clear();
    this.currentSessionId = null;
    return count;
  }

  getSessionsByAgent(agentId: string): Session[] {
    const sessions: Session[] = [];

    this.sessions.forEach((session) => {
      if (session.agentId === agentId) {
        sessions.push(session);
      }
    });

    return sessions;
  }

  getRecentSessions(limit: number = 10): Session[] {
    const sessions = Array.from(this.sessions.values());

    sessions.sort((a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime());

    return sessions.slice(0, limit);
  }

  isSessionActive(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return false;
    }

    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    return session.lastActivityAt > thirtyMinutesAgo;
  }

  cleanupInactiveSessions(): number {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    let deletedCount = 0;

    this.sessions.forEach((session, id) => {
      if (session.lastActivityAt < thirtyMinutesAgo) {
        this.sessions.delete(id);
        deletedCount++;
      }
    });

    return deletedCount;
  }

  getOrCreateSession(agentId: string): Session {
    const currentSession = this.getCurrentSession();

    if (currentSession && currentSession.agentId === agentId) {
      return currentSession;
    }

    const agentSessions = this.getSessionsByAgent(agentId);

    if (agentSessions.length > 0) {
      const mostRecent = agentSessions.reduce((latest, session) =>
        session.lastActivityAt > latest.lastActivityAt ? session : latest,
      );

      if (this.isSessionActive(mostRecent.id)) {
        this.currentSessionId = mostRecent.id;
        mostRecent.isContinued = true;
        return mostRecent;
      }
    }

    return this.createSession(agentId);
  }

  resetCurrentSession(): void {
    const currentSession = this.getCurrentSession();

    if (currentSession) {
      this.clearMessages(currentSession.id);
    }
  }

  getSessionTitle(session: Session): string {
    if (session.messages.length === 0) {
      return "New Chat";
    }

    const firstUserMessage = session.messages.find((m) => m.role === "user");
    if (firstUserMessage) {
      const content = firstUserMessage.content || "";
      return content.length > 50 ? content.substring(0, 47) + "..." : content;
    }

    return "New Chat";
  }
}

export const sessionManager = new SessionManager();
