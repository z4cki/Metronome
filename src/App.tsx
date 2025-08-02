import "./App.css";
import { Metronome } from "./components/Metronome";
import { DailyTasks } from "./components/DailyTasks";
import { ChordDiagrams } from "./components/ChordDiagrams";
import { Tabs, Image } from "antd";
import type { TabsProps } from "antd";

function App() {
  const items: TabsProps["items"] = [
    {
      key: "Diagrams",
      label: "Diagrams",
      children: <ChordDiagrams />,
    },
    {
      key: "Chords",
      label: "Chords",
      children: <Image width={300} src="/images/chord/chord_transitions.jpg" />,
    },
    {
      key: "Patterns",
      label: "All Pattern",
      children: <Image width={300} src="/images/pattern/all_pattern.png" />,
    },
  ];

  return (
    <div className="App">
      <div className="layout-container">
        <div className="metronome-section">
          <Metronome />

          <Tabs defaultActiveKey="1" items={items} />
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
