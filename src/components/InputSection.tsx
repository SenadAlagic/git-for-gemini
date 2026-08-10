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
      let branchId = activeBranchId;
      let messageHistory = getHistory();

      // No conversation yet (fresh app, or user hasn't started one) - spin
      // one up on the fly instead of throwing. addConversation/addBranch
      // return the ids synchronously, so we use those directly rather than
      // activeConversationId/activeBranchId, which won't reflect this yet.
      if (!activeConversationId || !branchId) {
        const title =
          message.length > 40 ? `${message.slice(0, 40)}…` : message;
        const { branch } = addConversation(title);
        branchId = branch.id;
        messageHistory = [];
      }

      console.log(`adding message "${message}"`);
      addMessage(message, "user", branchId);
      messageHistory.push({ role: "user", text: message });
      await sendMessage(messageHistory, branchId);
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
    <div className={cn("flex m-4")}>
      <form
        className={cn("flex flex-1 justify-center items-center")}
        onSubmit={(e) => {
          if (isLoading) return;
          e.preventDefault();
          detectCommand(message);
          setMessage("");
        }}
      >
        <InputGroup
          className={cn(
            "border-t border-border p-2 m-3 rounded-lg max-w-3xl h-12",
          )}
        >
          <InputGroupInput
            placeholder="Type your message"
            value={message}
            disabled={isLoading}
            onChange={onChange}
          />
          <InputGroupAddon align="inline-end">
            <button
              type="submit"
              className={cn(
                "flex items-center justify-center",
                "h-8 w-8 rounded-full",
                "text-muted-foreground transition-colors",
                "hover:text-foreground hover:bg-accent",
                "active:scale-95",
              )}
            >
              <SendHorizonal className="h-4 w-4" />
            </button>
          </InputGroupAddon>
        </InputGroup>
      </form>
    </div>
  );
};
