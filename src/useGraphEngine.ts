import React from "react";
import { holdConversation } from "./geminiApi";

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

export const useGraphEngine = () => {
  const [conversations, setConversations] = React.useState<
    Record<string, Conversation>
  >({});
  const [branches, setBranches] = React.useState<Record<string, Branch>>({});
  const [messages, setMessages] = React.useState<Record<string, Commit>>({});
  const [activeConversationId, setActiveConversationId] =
    React.useState<string>("");
  const [activeBranchId, setActiveBranchId] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const headCommitRef = React.useRef<string | undefined>(undefined);

  React.useEffect(() => {
    const currentBranch = branches[activeBranchId];
    headCommitRef.current = currentBranch?.head;
  }, [activeBranchId, branches]);

  const addConversation = (name: string) => {
    const conversationId = crypto.randomUUID();
    const branch = addBranch("main", conversationId);

    setConversations((prevConversations) => {
      return {
        ...prevConversations,
        [conversationId]: { id: conversationId, name, branch: branch.id },
      };
    });
    setActiveConversationId(conversationId);
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
    setBranches((prevBranches) => {
      return { ...prevBranches, [branch.id]: branch };
    });
    setActiveBranchId(branch.id);
    return branch;
  };

  const addMessage = (text: string, role: "user" | "model" = "user") => {
    const currentBranch = branches[activeBranchId];
    if (!currentBranch) throw new Error("No active branch");

    const commitId = crypto.randomUUID();
    const parentId = headCommitRef.current;
    const commit: Commit = {
      id: commitId,
      text,
      parent: parentId,
      role,
    };
    setMessages((prevMessages) => {
      return { ...prevMessages, [commit.id]: commit };
    });
    setBranches((prevBranches) => {
      return {
        ...prevBranches,
        [activeBranchId]: {
          ...currentBranch,
          head: commit.id,
        },
      };
    });
    headCommitRef.current = commitId;
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

  const sendMessage = async (messages: GeminiMessage[]) => {
    try {
      setIsLoading(true);
      const response = await holdConversation(messages);
      if (response) addMessage(response, "model");
    } catch (error) {
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
  };
};
