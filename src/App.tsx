import { Chat, AppSidebar, InputSection } from "@/components";

function App() {
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
      <AppSidebar />
      <div style={{ display: "flex", flexDirection: "column", flex: 5 }}>
        <Chat />
        <InputSection />
      </div>
    </div>
  );
}

export default App;
