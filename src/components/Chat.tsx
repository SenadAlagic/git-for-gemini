import { ChatBubble } from "./ChatBubble";

export type ChatProps = {
  messages: string[];
};

export const Chat = ({ messages }: ChatProps) => {
  return (
    <div
      style={{
        display: "flex",
        flex: 4,
        padding: 8,
        border: "1px solid #d9d9d9",
      }}
    >
      <div
        style={{ display: "flex", flex: 1, flexDirection: "column", gap: 12 }}
      >
        {messages.map((message) => (
          <ChatBubble key={message} text={message} />
        ))}
      </div>
    </div>
  );
};
