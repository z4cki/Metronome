import React, { useState, useEffect, useRef } from "react";
import "./ChordTransition.css";

interface ChordPair {
  id: number;
  chord1: string;
  chord2: string;
  difficulty: "easy" | "medium" | "hard";
  description: string;
}

export const ChordTransition: React.FC = () => {
  const chordPairs: ChordPair[] = [
    {
      id: 1,
      chord1: "G",
      chord2: "C",
      difficulty: "easy",
      description: "Basic open chord transition",
    },
    {
      id: 2,
      chord1: "C",
      chord2: "D",
      difficulty: "easy",
      description: "Basic open chord transition",
    },
    {
      id: 20,
      chord1: "C",
      chord2: "F minor",
      difficulty: "easy",
      description: "Basic open chord transition",
    },
    {
      id: 3,
      chord1: "G",
      chord2: "D",
      difficulty: "easy",
      description: "Basic open chord transition",
    },
    {
      id: 4,
      chord1: "G",
      chord2: "Em",
      difficulty: "easy",
      description: "Major-minor chord transition",
    },
    {
      id: 5,
      chord1: "Am",
      chord2: "E",
      difficulty: "medium",
      description: "Minor-major chord transition",
    },
    {
      id: 6,
      chord1: "C",
      chord2: "Am",
      difficulty: "easy",
      description: "Relative major-minor chords",
    },
    {
      id: 7,
      chord1: "F",
      chord2: "C",
      difficulty: "medium",
      description: "Barre chord transition",
    },
    {
      id: 8,
      chord1: "D",
      chord2: "A",
      difficulty: "medium",
      description: "Large finger position change",
    },
    {
      id: 9,
      chord1: "Bm",
      chord2: "G",
      difficulty: "hard",
      description: "Barre to open chord transition",
    },
    {
      id: 10,
      chord1: "F",
      chord2: "G7",
      difficulty: "medium",
      description: "Basic to seventh chord transition",
    },
    {
      id: 11,
      chord1: "Cmaj7",
      chord2: "Am7",
      difficulty: "medium",
      description: "Major-minor seventh chord transition",
    },
    {
      id: 12,
      chord1: "Em7",
      chord2: "A7",
      difficulty: "medium",
      description: "Minor seventh to dominant seventh transition",
    },
    {
      id: 13,
      chord1: "D",
      chord2: "Bm",
      difficulty: "medium",
      description: "Major to minor third transition",
    },
    {
      id: 14,
      chord1: "F#m",
      chord2: "B",
      difficulty: "hard",
      description: "Advanced chord transition",
    },
    {
      id: 15,
      chord1: "Dm",
      chord2: "G7",
      difficulty: "medium",
      description: "II-V chord progression",
    },
  ];

  const [activeChordPair, setActiveChordPair] = useState<ChordPair | null>(
    null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(60);
  const [countdown, setCountdown] = useState(4);
  const [currentChord, setCurrentChord] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    "all" | "easy" | "medium" | "hard"
  >("all");

  const timerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const countIntervalRef = useRef<number | null>(null);

  const filteredChordPairs =
    selectedDifficulty === "all"
      ? chordPairs
      : chordPairs.filter((pair) => pair.difficulty === selectedDifficulty);

  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
  };

  const playClick = (isAccented: boolean = false) => {
    if (!audioContextRef.current) return;

    const osc = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    if (isAccented) {
      osc.frequency.value = 1200;
      gainNode.gain.value = 0.7;
    } else {
      osc.frequency.value = 800;
      gainNode.gain.value = 0.5;
    }

    osc.start();
    osc.stop(audioContextRef.current.currentTime + 0.05);
  };

  const startChordTransition = () => {
    if (!activeChordPair) return;

    initAudio();
    setIsPlaying(true);
    setCurrentChord("");

    playClick(true);
    setCountdown(4);

    let count = 3;
    countIntervalRef.current = window.setInterval(() => {
      if (count > 0) {
        playClick(false);
        setCountdown(count);
        count -= 1;
      } else {
        if (countIntervalRef.current) {
          clearInterval(countIntervalRef.current);
          countIntervalRef.current = null;
        }
        setCountdown(0);
        startChordSwitch();
      }
    }, (60 / bpm) * 1000);
  };

  const startChordSwitch = () => {
    if (!activeChordPair) return;

    setCurrentChord(activeChordPair.chord1);
    playClick(true);

    let isFirstChord = true;

    timerRef.current = window.setInterval(() => {
      isFirstChord = !isFirstChord;

      setCurrentChord(
        isFirstChord ? activeChordPair.chord1 : activeChordPair.chord2
      );

      playClick(true);
    }, (60 / bpm) * 1000);
  };

  const stopChordTransition = () => {
    setIsPlaying(false);
    setCurrentChord("");
    setCountdown(4);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (countIntervalRef.current) {
      clearInterval(countIntervalRef.current);
      countIntervalRef.current = null;
    }
  };

  const selectChordPair = (pair: ChordPair) => {
    stopChordTransition();
    setActiveChordPair(pair);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (countIntervalRef.current) {
        clearInterval(countIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="chord-transition-container">
      <h1>Chord Transition Practice</h1>

      <div className="control-panel">
        <div className="bpm-control">
          <label htmlFor="bpm-slider">Speed (BPM): {bpm}</label>
          <input
            type="range"
            id="bpm-slider"
            min="40"
            max="120"
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="bpm-slider"
          />
        </div>

        <div className="difficulty-filter">
          <span>Difficulty Filter:</span>
          <div className="filter-buttons">
            <button
              className={selectedDifficulty === "all" ? "active" : ""}
              onClick={() => setSelectedDifficulty("all")}
            >
              All
            </button>
            <button
              className={selectedDifficulty === "easy" ? "active" : ""}
              onClick={() => setSelectedDifficulty("easy")}
            >
              Easy
            </button>
            <button
              className={selectedDifficulty === "medium" ? "active" : ""}
              onClick={() => setSelectedDifficulty("medium")}
            >
              Medium
            </button>
            <button
              className={selectedDifficulty === "hard" ? "active" : ""}
              onClick={() => setSelectedDifficulty("hard")}
            >
              Hard
            </button>
          </div>
        </div>
      </div>

      <div className="practice-area">
        <div className="chord-display">
          {!isPlaying ? (
            activeChordPair ? (
              <div className="selected-pair-info">
                <div className="chord-pair-title">
                  {activeChordPair.chord1} ⟷ {activeChordPair.chord2}
                </div>
                <div className="chord-pair-desc">
                  {activeChordPair.description}
                </div>
              </div>
            ) : (
              <div className="select-prompt">
                Please select a chord pair to practice
              </div>
            )
          ) : countdown > 0 ? (
            <div className="countdown">{countdown}</div>
          ) : (
            <div className="current-chord">{currentChord}</div>
          )}
        </div>

        <div className="action-buttons">
          <button
            className={`start-button ${isPlaying ? "stop" : ""}`}
            onClick={isPlaying ? stopChordTransition : startChordTransition}
            disabled={!activeChordPair && !isPlaying}
          >
            {isPlaying ? "Stop" : "Start"}
          </button>
        </div>
      </div>

      <h2>Chord Transition List</h2>
      <div className="chord-pairs-list">
        {filteredChordPairs.map((pair) => (
          <div
            key={pair.id}
            className={`chord-pair-item ${
              activeChordPair?.id === pair.id ? "active" : ""
            } difficulty-${pair.difficulty}`}
            onClick={() => selectChordPair(pair)}
          >
            <div className="chord-names">
              {pair.chord1} ⟷ {pair.chord2}
            </div>
            <div className="chord-info">
              <span className={`difficulty-badge ${pair.difficulty}`}>
                {pair.difficulty === "easy"
                  ? "Easy"
                  : pair.difficulty === "medium"
                  ? "Medium"
                  : "Hard"}
              </span>
              <span className="chord-description">{pair.description}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="practice-tips">
        <h3>Practice Tips</h3>
        <ul>
          <li>Focus on quick, clean transitions between chord pairs</li>
          <li>Start with slower speeds to ensure each note rings clearly</li>
          <li>
            Pay attention to finger positions and movement paths to minimize
            unnecessary motion
          </li>
          <li>Gradually increase the speed to challenge yourself</li>
          <li>Maintain rhythm even if you can't perfectly form every chord</li>
        </ul>
      </div>
    </div>
  );
};
