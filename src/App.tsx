import { useState } from "react";
import "./App.css";
import { Metronome } from "./components/Metronome";
import { GuitarPractice } from "./components/GuitarPractice";
import { ChordTransition } from "./components/ChordTransition";

function App() {
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
            Metronome
          </button>
          <button
            className={`tab ${activeTab === "practice" ? "active" : ""}`}
            onClick={() => setActiveTab("practice")}
          >
            Finger Exercises
          </button>
          <button
            className={`tab ${activeTab === "chords" ? "active" : ""}`}
            onClick={() => setActiveTab("chords")}
          >
            Chord Transition
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
