import "./App.css";
import { Metronome } from "./components/Metronome";
import { DailyTasks } from "./components/DailyTasks";
import { ChordDiagrams } from "./components/ChordDiagrams";

function App() {
  return (
    <div className="App">
      <div className="layout-container">
        <div className="metronome-section">
          <Metronome />
          <ChordDiagrams />
        </div>

        <div className="content-section">
          <div className="content-container">
            <DailyTasks />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
