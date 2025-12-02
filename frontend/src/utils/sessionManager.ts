import { SessionData } from '@/types/property';

const SESSION_KEY = 'hocs_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const saveSession = (data: SessionData): void => {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save session:', error);
  }
};

export const loadSession = (): SessionData | null => {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;

    const session: SessionData = JSON.parse(stored);
    const now = Date.now();

    // Check if session has expired
    if (now - session.timestamp > SESSION_DURATION) {
      clearSession();
      return null;
    }

    return session;
  } catch (error) {
    console.error('Failed to load session:', error);
    return null;
  }
};

export const clearSession = (): void => {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error('Failed to clear session:', error);
  }
};

export const updateSession = (updates: Partial<SessionData>): void => {
  const current = loadSession();
  if (current) {
    saveSession({ ...current, ...updates, timestamp: Date.now() });
  }
};