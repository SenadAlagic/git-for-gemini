import type { GeminiMessage } from "../useGraphEngine";

export type ChatBubbleProps = {
  message: GeminiMessage;
};

export const ChatBubble = ({ message }: ChatBubbleProps) => {
  return (
    <div
      style={{
        backgroundColor: message.role === "model" ? "#1677FF" : "#f0f0f0",
        padding: 8,
        borderRadius: 4,
        boxSizing: "border-box",
        maxWidth: 300,
        alignSelf: message.role === "model" ? "" : "flex-end",
      }}
    >
      {message.text}
    </div>
  );
};
