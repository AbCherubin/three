import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import ThreeScene from "./components/ThreeScene";
import KMLViewer from "./components/KMLViewer";
function App() {
  const [count, setCount] = useState(0);
  console.log("APP");
  return (
    <>
      <div className="app">
        {/* <ThreeScene /> */}
        <KMLViewer />
      </div>
    </>
  );
}

export default App;
