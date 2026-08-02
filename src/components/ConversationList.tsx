import type { useGraphEngine } from "../useGraphEngine";
import { ListEntry } from "./ListEntry";

type GraphEngineType = ReturnType<typeof useGraphEngine>;

export type ConversationListProps = Pick<
  GraphEngineType,
  | "conversations"
  | "branches"
  | "activeConversationId"
  | "activeBranchId"
  | "checkoutBranch"
  | "checkoutConversation"
>;

export const ConversationList = ({
  conversations,
  branches,
  activeConversationId,
  activeBranchId,
  checkoutBranch,
  checkoutConversation,
}: ConversationListProps) => {
  const filteredBranches = Object.entries(branches).filter(
    ([, branch]) => branch.conversationId === activeConversationId,
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 8,
        flex: 1,
        border: "1px solid #d9d9d9",
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <div style={{ marginBottom: 8 }}>Conversations</div>
        {Object.entries(conversations).map(([id, conversation]) => (
          <ListEntry
            key={id}
            isActive={activeConversationId === id}
            name={conversation.name}
            onClick={() => {
              checkoutConversation(conversation.id);
            }}
          />
        ))}
      </div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ marginBottom: 8 }}>Branches</div>
        {filteredBranches.map(([id, branch]) => (
          <ListEntry
            key={id}
            isActive={activeBranchId === id}
            name={branch.name}
            onClick={() => {
              checkoutBranch(branch.name);
            }}
          />
        ))}
      </div>
    </div>
  );
};
