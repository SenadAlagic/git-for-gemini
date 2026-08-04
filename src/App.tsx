import { ConversationList } from "./components/ConversationList";
import { InputSection } from "./components/InputSection";
import { Chat } from "./components";
import { useGraphEngine } from "./useGraphEngine";

function App() {
  const {
    conversations,
    branches,
    activeBranchId,
    activeConversationId,
    isLoading,
    sendMessage,
    addConversation,
    addBranch,
    addMessage,
    checkoutBranch,
    checkoutConversation,
    getHistory,
  } = useGraphEngine();

  const currentMessages = getHistory();

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        height: "100vh",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <ConversationList
        conversations={conversations}
        branches={branches}
        activeBranchId={activeBranchId}
        activeConversationId={activeConversationId}
        checkoutBranch={checkoutBranch}
        checkoutConversation={checkoutConversation}
      />
      <div style={{ display: "flex", flexDirection: "column", flex: 5 }}>
        <Chat messages={currentMessages} isLoading={isLoading} />
        <InputSection
          addConversation={addConversation}
          addBranch={addBranch}
          addMessage={addMessage}
          checkoutBranch={checkoutBranch}
          getHistory={getHistory}
          sendMessage={sendMessage}
          activeConversationId={activeConversationId}
          activeBranchId={activeBranchId}
          branches={branches}
        />
      </div>
    </div>
  );
}

export default App;
