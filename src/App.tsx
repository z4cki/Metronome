import { useState } from "react";
import "./App.css";
import { Metronome } from "./components/Metronome";
import { GuitarPractice } from "./components/GuitarPractice";
import { ChordTransition } from "./components/ChordTransition";

function App() {
  // 用于跟踪当前活动的选项卡
  const [activeTab, setActiveTab] = useState<
    "metronome" | "practice" | "chords"
  >("metronome");

  return (
    <div className="App">
      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === "metronome" ? "active" : ""}`}
            onClick={() => setActiveTab("metronome")}
          >
            节拍器
          </button>
          <button
            className={`tab ${activeTab === "practice" ? "active" : ""}`}
            onClick={() => setActiveTab("practice")}
          >
            爬格子练习
          </button>
          <button
            className={`tab ${activeTab === "chords" ? "active" : ""}`}
            onClick={() => setActiveTab("chords")}
          >
            和弦转换
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "metronome" && <Metronome />}
          {activeTab === "practice" && <GuitarPractice />}
          {activeTab === "chords" && <ChordTransition />}
        </div>
      </div>
    </div>
  );
}

export default App;
