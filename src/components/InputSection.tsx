import React from "react";
import { cn } from "@/lib/utils";
import { SendHorizonal } from "lucide-react";
import { useEngineContext } from "@/context/EngineContext";
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui";

export const InputSection = () => {
  const [message, setMessage] = React.useState<string>("");

  const {
    addConversation,
    addBranch,
    checkoutBranch,
    addMessage,
    getHistory,
    sendMessage,
    activeConversationId,
    activeBranchId,
    branches,
    isLoading,
  } = useEngineContext();

  const detectCommand = async (message: string) => {
    if (!message.startsWith("/")) {
      console.log(`adding message "${message}"`);
      const messageHistory = getHistory();
      addMessage(message);
      messageHistory.push({ role: "user", text: message });
      await sendMessage(messageHistory);
      return false;
    }

    const firstSection = message.split(" ")[0];
    const argument = message.split(" ")[1];
    const messageParent = branches[activeBranchId]?.head;

    switch (firstSection) {
      case "/conversation":
        console.log(`creating conversation ${argument}`);
        addConversation(argument);
        break;
      case "/branch":
        console.log(`creating branch ${argument}`);
        addBranch(argument, activeConversationId, messageParent);
        break;
      case "/checkout":
        console.log(`checking out ${argument}`);
        checkoutBranch(argument);
        break;
      case "/history":
        console.log(`history ${getHistory()}`);
        break;
      default:
        console.log("Unknown command");
        break;
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  return (
    <div style={{ display: "flex" }}>
      <form
        style={{
          display: "flex",
          flex: 1,
        }}
        onSubmit={(e) => {
          if (isLoading) return;
          e.preventDefault();
          detectCommand(message);
          setMessage("");
        }}
      >
        <InputGroup className={cn("border-t border-border p-2 m-3 rounded-lg")}>
          <InputGroupInput
            placeholder="Type your message"
            value={message}
            disabled={isLoading}
            onChange={onChange}
          />
          <InputGroupAddon align="inline-end">
            <SendHorizonal />
          </InputGroupAddon>
        </InputGroup>
      </form>
    </div>
  );
};
