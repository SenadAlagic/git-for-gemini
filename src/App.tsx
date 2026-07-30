import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import "./App.css";
import { playgroundTest } from "./graphEngine";
import React from "react";

function App() {
  const ref = React.useRef<boolean>(false);
  React.useEffect(() => {
    if (ref.current) {
      return;
    }
    console.clear(); // Cleans up the console on fast-refreshes
    playgroundTest();
    ref.current = true;
  }, []);

  return (
    <section id="center">
      <div className="hero">
        <img src={heroImg} className="base" width="170" height="179" alt="" />
        <img src={reactLogo} className="framework" alt="React logo" />
        <img src={viteLogo} className="vite" alt="Vite logo" />
      </div>
    </section>
  );
}

export default App;
