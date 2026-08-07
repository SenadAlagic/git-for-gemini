import React from "react";
import { useEngineContext } from "@/context/EngineContext";
import { Spinner, Bubble, BubbleContent } from "@/components/ui";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { AlertCircle } from "lucide-react";

export const Chat = () => {
  const { getHistory, isLoading, error } = useEngineContext();
  const messages = getHistory();
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
        {messages.map((message) => (
          <Bubble
            key={message.text}
            align={message.role === "model" ? "start" : "end"}
            variant={message.role === "model" ? "secondary" : "default"}
          >
            <BubbleContent>{message.text}</BubbleContent>
          </Bubble>
        ))}
        {isLoading && <Spinner className="size-4" />}
        {error && (
          <Alert variant="destructive" className="mb-4 max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};
