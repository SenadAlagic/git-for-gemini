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
  const [activeConversationId, setActiveConversationId] =
    React.useState<string>(initialState.activeConversationId);
  const [activeBranchId, setActiveBranchId] = React.useState<string>(
    initialState.activeBranchId,
  );
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputFocusHandlerRef = React.useRef<(() => void) | null>(null);

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
    inputFocusHandlerRef.current?.();

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

  const registerInputFocus = React.useCallback((focusHandler: () => void) => {
    inputFocusHandlerRef.current = focusHandler;
  }, []);

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

  const renameConversation = (conversationId: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) throw new Error("Name can't be empty");

    setConversations((prevConversations) => {
      if (!prevConversations[conversationId]) return prevConversations;
      return {
        ...prevConversations,
        [conversationId]: {
          ...prevConversations[conversationId],
          name: trimmed,
        },
      };
    });
  };

  const renameBranch = (branchId: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) throw new Error("Name can't be empty");

    const branch = branches[branchId];
    if (!branch) return;

    const conflict = Object.values(branches).some(
      (b) =>
        b.id !== branchId &&
        b.conversationId === branch.conversationId &&
        b.name === trimmed,
    );
    if (conflict) {
      throw new Error(
        `Branch '${trimmed}' already exists in this conversation`,
      );
    }

    setBranches((prevBranches) => {
      if (!prevBranches[branchId]) return prevBranches;
      return {
        ...prevBranches,
        [branchId]: { ...prevBranches[branchId], name: trimmed },
      };
    });
  };

  // Removes only the branch pointer, matching git's own model: any commits
  // it referenced stay around (they may still be reachable from a sibling
  // branch that forked off the same history) and are never deleted here.
  const deleteBranch = (branchId: string) => {
    const branch = branches[branchId];
    if (!branch) return;

    const siblingBranches = Object.values(branches).filter(
      (b) => b.conversationId === branch.conversationId && b.id !== branchId,
    );

    if (siblingBranches.length === 0) {
      throw new Error(
        "Can't delete the only branch in a conversation - delete the conversation instead.",
      );
    }

    setBranches((prevBranches) => {
      const nextBranches = { ...prevBranches };
      delete nextBranches[branchId];
      return nextBranches;
    });
    delete branchHeadsRef.current[branchId];

    if (activeBranchId === branchId) {
      const fallback = siblingBranches[0];
      setActiveBranchId(fallback.id);
      setConversations((prevConversations) => ({
        ...prevConversations,
        [branch.conversationId]: {
          ...prevConversations[branch.conversationId],
          branch: fallback.id,
        },
      }));
    }
  };

  // Unlike deleteBranch, this removes every branch in the conversation at
  // once, which means none of their commits can ever be reachable again -
  // commits are never shared across conversations, so it's safe to clean
  // them up here rather than leaving them orphaned in storage forever.
  const deleteConversation = (conversationId: string) => {
    const conversation = conversations[conversationId];
    if (!conversation) return;

    const conversationBranches = Object.values(branches).filter(
      (b) => b.conversationId === conversationId,
    );

    const commitIdsToDelete = new Set<string>();
    for (const branch of conversationBranches) {
      let commitId = branch.head;
      while (commitId && !commitIdsToDelete.has(commitId)) {
        commitIdsToDelete.add(commitId);
        commitId = messages[commitId]?.parent;
      }
    }

    setConversations((prevConversations) => {
      const nextConversations = { ...prevConversations };
      delete nextConversations[conversationId];
      return nextConversations;
    });
    setBranches((prevBranches) => {
      const nextBranches = { ...prevBranches };
      for (const branch of conversationBranches) delete nextBranches[branch.id];
      return nextBranches;
    });
    setMessages((prevMessages) => {
      const nextMessages = { ...prevMessages };
      for (const id of commitIdsToDelete) delete nextMessages[id];
      return nextMessages;
    });
    for (const branch of conversationBranches) {
      delete branchHeadsRef.current[branch.id];
    }

    if (activeConversationId === conversationId) {
      const remaining = Object.values(conversations).filter(
        (c) => c.id !== conversationId,
      );
      if (remaining.length > 0) {
        const fallback = remaining[0];
        setActiveConversationId(fallback.id);
        setActiveBranchId(fallback.branch);
      } else {
        setActiveConversationId("");
        setActiveBranchId("");
      }
    }
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
    renameConversation,
    renameBranch,
    deleteBranch,
    deleteConversation,
    addMessage,
    sendMessage,
    getHistory,
    registerInputFocus,
    conversations,
    isLoading,
    activeConversationId,
    activeBranchId,
    branches,
    messages,
    error,
  };
};
