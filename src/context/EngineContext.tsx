import { useEngine } from "@/hooks/useEngine";
import React from "react";

type GraphContextType = ReturnType<typeof useEngine>;

const EngineContext = React.createContext<GraphContextType | undefined>(
  undefined,
);

export const EngineProvider = ({ children }: React.PropsWithChildren) => {
  const engine = useEngine();

  return (
    <EngineContext.Provider value={engine}>{children}</EngineContext.Provider>
  );
};

export const useEngineContext = () => {
  const context = React.useContext(EngineContext);
  if (!context) {
    throw new Error("useEngineContext must be used within an EngineProvider");
  }
  return context;
};
