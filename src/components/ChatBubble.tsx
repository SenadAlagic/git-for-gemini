export type ChatBubbleProps = {
  text: string;
  // type: "primary" | "secondary";
};
export const ChatBubble = ({ text }: ChatBubbleProps) => {
  return (
    <div
      style={{
        // backgroundColor: type === "primary" ? "#1677FF" : "#f0f0f0",
        backgroundColor: "#1677FF",
        padding: 8,
        borderRadius: 4,
        boxSizing: "border-box",
        maxWidth: 300,
        // alignSelf: type === "primary" ? "" : "flex-end",
        alignSelf: "flex-end",
      }}
    >
      {text}
    </div>
  );
};
