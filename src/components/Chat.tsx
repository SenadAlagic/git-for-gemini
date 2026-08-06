import React from "react";
import type { GeminiMessage } from "../useGraphEngine";
import { ChatBubble } from "./ChatBubble";

export type ChatProps = {
  messages: GeminiMessage[];
  isLoading: boolean;
};

export const Chat = ({ messages, isLoading }: ChatProps) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = React.useRef<number>(0);

  React.useEffect(() => {
    const {
      scrollTop = 0,
      scrollHeight = 0,
      clientHeight = 0,
    } = scrollRef.current || {};

    const prevScollHeight = prevScrollHeightRef.current ?? scrollHeight;
    const distanceFromBottom = prevScollHeight - scrollTop - clientHeight;
    if (distanceFromBottom < 150) {
      scrollRef.current?.scrollTo({ top: scrollHeight, behavior: "smooth" });
    }
    prevScrollHeightRef.current = scrollHeight;
  }, [messages, scrollRef]);

  return (
    <div
      ref={scrollRef}
      style={{
        display: "flex",
        flex: 4,
        padding: 8,
        border: "1px solid #d9d9d9",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          gap: 12,
        }}
      >
        {messages.map((message, index) => (
          <ChatBubble key={`${index}+${message.text}`} message={message} />
        ))}
        {isLoading && <div>Loading...</div>}
      </div>
    </div>
  );
};
