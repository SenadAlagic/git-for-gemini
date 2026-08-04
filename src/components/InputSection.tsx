import React from "react";
import type { useGraphEngine } from "../useGraphEngine";

type GraphEngineProps = ReturnType<typeof useGraphEngine>;

export type InputSectionProps = Pick<
  GraphEngineProps,
  | "addConversation"
  | "addBranch"
  | "checkoutBranch"
  | "addMessage"
  | "getHistory"
  | "activeConversationId"
  | "activeBranchId"
  | "branches"
  | "sendMessage"
>;

export const InputSection = ({
  addConversation,
  addBranch,
  checkoutBranch,
  addMessage,
  getHistory,
  sendMessage,
  activeConversationId,
  activeBranchId,
  branches,
}: InputSectionProps) => {
  const [message, setMessage] = React.useState<string>("");

  const detectCommand = async (message: string) => {
    if (!message.startsWith("/")) {
      console.log(`adding message "${message}"`);
      const historicalCommits = getHistory();
      addMessage(message);
      historicalCommits.push({ role: "user", text: message });
      await sendMessage(historicalCommits);
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
    <div style={{ display: "flex", border: "1px solid #d9d9d9" }}>
      <form
        style={{
          display: "flex",
          flex: 1,
        }}
        onSubmit={(e) => {
          e.preventDefault();
          detectCommand(message);
          setMessage("");
        }}
      >
        <input
          style={{
            height: 20,
            display: "flex",
            flex: 1,
            padding: 8,
            margin: 8,
          }}
          placeholder="Type your message"
          value={message}
          onChange={onChange}
        />
      </form>
    </div>
  );
};
