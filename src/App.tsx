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
    addConversation,
    addBranch,
    addMessage,
    checkoutBranch,
    getHistory,
  } = useGraphEngine();

  const currentMessages = getHistory();

  return (
    <div style={{ display: "flex", flex: 1, height: "100%", width: "100%" }}>
      <ConversationList
        conversations={conversations}
        branches={branches}
        activeBranchId={activeBranchId}
        activeConversationId={activeConversationId}
      />
      <div style={{ display: "flex", flexDirection: "column", flex: 2 }}>
        <Chat messages={currentMessages} />
        <InputSection
          addConversation={addConversation}
          addBranch={addBranch}
          addMessage={addMessage}
          checkoutBranch={checkoutBranch}
          getHistory={getHistory}
          activeConversationId={activeConversationId}
          activeBranchId={activeBranchId}
          branches={branches}
        />
      </div>
    </div>
  );
}

export default App;
