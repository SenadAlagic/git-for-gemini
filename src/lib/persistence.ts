import type { Branch, Commit, Conversation } from "@/hooks/useEngine";

const STORAGE_KEY = "git-for-gemini:engine-state:v1";

export type PersistedEngineState = {
  conversations: Record<string, Conversation>;
  branches: Record<string, Branch>;
  messages: Record<string, Commit>;
  activeConversationId: string;
  activeBranchId: string;
};

type PersistedEnvelope = PersistedEngineState & { version: 1 };

const emptyState = (): PersistedEngineState => ({
  conversations: {},
  branches: {},
  messages: {},
  activeConversationId: "",
  activeBranchId: "",
});

const isBrowserStorageAvailable = () =>
  typeof window !== "undefined" && !!window.localStorage;

export const loadPersistedState = (): PersistedEngineState => {
  if (!isBrowserStorageAvailable()) return emptyState();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();

    const parsed = JSON.parse(raw) as Partial<PersistedEnvelope>;

    return {
      conversations: parsed.conversations ?? {},
      branches: parsed.branches ?? {},
      messages: parsed.messages ?? {},
      activeConversationId: parsed.activeConversationId ?? "",
      activeBranchId: parsed.activeBranchId ?? "",
    };
  } catch (error) {
    console.warn("Failed to load persisted engine state, starting fresh.", error);
    return emptyState();
  }
};

export const savePersistedState = (state: PersistedEngineState) => {
  if (!isBrowserStorageAvailable()) return;

  try {
    const envelope: PersistedEnvelope = { version: 1, ...state };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
  } catch (error) {
    console.warn("Failed to persist engine state.", error);
  }
};
