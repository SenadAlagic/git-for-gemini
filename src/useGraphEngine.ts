import React from "react";

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

  const addMessage = (text: string) => {
    const currentBranch = branches[activeBranchId];
    if (!currentBranch) throw new Error("No active branch");
    const commit: Commit = {
      id: crypto.randomUUID(),
      text,
      parent: currentBranch.head,
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
    // if (!currentBranch) {
    //   throw new Error("Current branch doesn't exist");
    // }
    // if (!currentBranch.head) {
    //   throw new Error("Current branch doesn't have a HEAD commit");
    // }

    if (!currentBranch || !currentBranch.head) return [];
    const messageArray: string[] = [];
    let commitId: string | undefined = currentBranch.head;

    while (commitId) {
      const workingCommit: Commit = messages[commitId];
      if (!workingCommit) break;
      messageArray.push(workingCommit.text);
      commitId = workingCommit.parent;
    }

    return messageArray.reverse();
  };

  return {
    addConversation,
    addBranch,
    checkoutBranch,
    checkoutConversation,
    addMessage,
    getHistory,
    conversations,
    activeConversationId,
    activeBranchId,
    branches,
    messages,
  };
};
