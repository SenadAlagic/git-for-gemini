import type { Branch, Conversation } from "../useGraphEngine";
import { ListEntry } from "./ListEntry";

export type ConversationListProps = {
  conversations: Record<string, Conversation>;
  branches: Record<string, Branch>;
  activeConversationId: string;
  activeBranchId: string;
};

export const ConversationList = ({
  conversations,
  branches,
  activeConversationId,
  activeBranchId,
}: ConversationListProps) => {
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
              console.log(conversation.name);
            }}
          />
        ))}
      </div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ marginBottom: 8 }}>Branches</div>
        {Object.entries(branches).map(([id, branch]) => (
          <ListEntry
            key={id}
            isActive={activeBranchId === id}
            name={branch.name}
            onClick={() => {
              console.log(branch.name);
            }}
          />
        ))}
      </div>
    </div>
  );
};
