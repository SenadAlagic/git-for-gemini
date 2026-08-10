import React from "react";
import { holdConversation } from "../geminiApi";
import { loadPersistedState, savePersistedState } from "@/lib/persistence";

export type Conversation = {
  id: string;
  name: string;
  branch: string;
};

export type Branch = {
  id: string;
  conversationId: string;
  name: string;
  head?: string;
};

export type Commit = {
  id: string;
  parent?: string;
  text: string;
  role: "user" | "model";
};

export type GeminiMessage = {
  text: string;
  role: "user" | "model";
};

export const useEngine = () => {
  const initialState = React.useRef(loadPersistedState()).current;

  const [conversations, setConversations] = React.useState<
    Record<string, Conversation>
  >(initialState.conversations);
  const [branches, setBranches] = React.useState<Record<string, Branch>>(
    initialState.branches,
  );
  const [messages, setMessages] = React.useState<Record<string, Commit>>(
    initialState.messages,
  );
  const [activeConversationId, setActiveConversationId] = React.useState<string>(
    initialState.activeConversationId,
  );
  const [activeBranchId, setActiveBranchId] = React.useState<string>(
    initialState.activeBranchId,
  );
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  // Authoritative, synchronous view of each branch's head commit. React state
  // updates (even functional ones queued in the same tick) aren't readable
  // back out until the next render, so anything that needs to know "what did
  // I just create" in the same synchronous block of code reads/writes this
  // ref instead of `branches`.
  const branchHeadsRef = React.useRef<Record<string, string | undefined>>(
    Object.fromEntries(
      Object.entries(initialState.branches).map(([id, branch]) => [
        id,
        branch.head,
      ]),
    ),
  );

  React.useEffect(() => {
    savePersistedState({
      conversations,
      branches,
      messages,
      activeConversationId,
      activeBranchId,
    });
  }, [conversations, branches, messages, activeConversationId, activeBranchId]);

  const addConversation = (name: string) => {
    const conversationId = crypto.randomUUID();
    const branch = addBranch("main", conversationId);
    const conversation: Conversation = {
      id: conversationId,
      name,
      branch: branch.id,
    };

    setConversations((prevConversations) => ({
      ...prevConversations,
      [conversationId]: conversation,
    }));
    setActiveConversationId(conversationId);

    return { conversation, branch };
  };

  const addBranch = (
    name: string,
    conversationId: string,
    parentId?: string,
  ) => {
    const existingBranch = Object.entries(branches).find(
      ([, branch]) =>
        branch.name === name && branch.conversationId === conversationId,
    );
    if (existingBranch) {
      throw new Error("Branch already exists");
    }
    const branch: Branch = {
      id: crypto.randomUUID(),
      conversationId,
      name,
      head: parentId,
    };
    branchHeadsRef.current[branch.id] = parentId;

    setBranches((prevBranches) => {
      return { ...prevBranches, [branch.id]: branch };
    });
    setActiveBranchId(branch.id);
    return branch;
  };

  // branchId defaults to the currently active branch, but callers that just
  // created a conversation/branch in the same synchronous block should pass
  // the id explicitly - `activeBranchId` won't reflect that yet.
  const addMessage = (
    text: string,
    role: "user" | "model" = "user",
    branchId: string = activeBranchId,
  ) => {
    if (!branchId) throw new Error("No active branch");

    const commitId = crypto.randomUUID();
    const parentId = branchHeadsRef.current[branchId];
    const commit: Commit = {
      id: commitId,
      text,
      parent: parentId,
      role,
    };
    branchHeadsRef.current[branchId] = commitId;

    setMessages((prevMessages) => {
      return { ...prevMessages, [commit.id]: commit };
    });
    setBranches((prevBranches) => {
      const currentBranch = prevBranches[branchId];
      if (!currentBranch) return prevBranches;
      return {
        ...prevBranches,
        [branchId]: {
          ...currentBranch,
          head: commit.id,
        },
      };
    });

    return commit;
  };

  const getCurrentBranch = () => {
    if (!activeBranchId) {
      return undefined;
    }
    return branches[activeBranchId];
  };

  const checkoutBranch = (name: string) => {
    if (!activeConversationId) {
      throw new Error("No active conversation");
    }

    const branch = Object.values(branches).find(
      (b) => b.name === name && b.conversationId === activeConversationId,
    );

    if (!branch) {
      throw new Error(`Branch '${name}' doesn't exist in this conversation`);
    }
    setActiveBranchId(branch.id);

    setConversations((prevConversations) => {
      return {
        ...prevConversations,
        [activeConversationId]: {
          ...prevConversations[activeConversationId],
          branch: branch.id,
        },
      };
    });
  };

  const checkoutConversation = (id: string) => {
    const conversation = conversations[id];
    if (!conversation) {
      throw new Error("Conversation doesn't exist");
    }
    setActiveConversationId(id);
    setActiveBranchId(conversation.branch);
  };

  const getHistory = () => {
    const currentBranch = getCurrentBranch();

    if (!currentBranch || !currentBranch.head) return [];
    const messageArray: GeminiMessage[] = [];
    let commitId: string | undefined = currentBranch.head;

    while (commitId) {
      const workingCommit: Commit = messages[commitId];
      if (!workingCommit) break;
      messageArray.push({
        text: workingCommit.text,
        role: workingCommit.role,
      });
      commitId = workingCommit.parent;
    }

    return messageArray.reverse();
  };

  // branchId mirrors addMessage's override: pass explicitly when the target
  // branch was just created in the same synchronous block as this call.
  const sendMessage = async (
    messages: GeminiMessage[],
    branchId: string = activeBranchId,
  ) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await holdConversation(messages);
      if (response) addMessage(response, "model", branchId);
    } catch (error) {
      setError(String(error));
      console.error("Gemini API error: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addConversation,
    addBranch,
    checkoutBranch,
    checkoutConversation,
    addMessage,
    sendMessage,
    getHistory,
    conversations,
    isLoading,
    activeConversationId,
    activeBranchId,
    branches,
    messages,
    error,
  };
};
