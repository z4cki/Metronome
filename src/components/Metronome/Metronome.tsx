import { useState, useEffect, useRef } from "react";
import { useBeatVisualization } from "../../hooks/useBeatVisualization";
import "./Metronome.css";

export const Metronome: React.FC = () => {
  const [tempo, setTempo] = useState<number>(60);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState<number>(4);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentBeat, setCurrentBeat] = useState<number>(0);
  const [tempoBpm, setTempoBpm] = useState<string>(tempo.toString());

  const { beatDots } = useBeatVisualization(beatsPerMeasure);

  const audioContextRef = useRef<AudioContext | null>(null);
  const timerIDRef = useRef<number | null>(null);

  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
  };

  const playClick = (isAccent: boolean) => {
    if (!audioContextRef.current) return;

    const osc = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    if (isAccent) {
      osc.frequency.value = 1500;
      gainNode.gain.value = 0.7;

      const osc2 = audioContextRef.current.createOscillator();
      const gainNode2 = audioContextRef.current.createGain();

      osc2.frequency.value = 1000;
      gainNode2.gain.value = 0.5;

      osc2.connect(gainNode2);
      gainNode2.connect(audioContextRef.current.destination);

      osc2.start();
      osc2.stop(audioContextRef.current.currentTime + 0.08);
    } else {
      osc.frequency.value = 700;
      gainNode.gain.value = 0.5;
    }

    osc.start();
    osc.stop(audioContextRef.current.currentTime + (isAccent ? 0.08 : 0.05));
  };

  const startMetronome = () => {
    initAudio();
    setIsPlaying(true);
    setCurrentBeat(0);

    const beatTime = (60 / tempo) * 1000;

    playClick(true);

    let beat = 0;

    const playBeat = () => {
      beat = (beat + 1) % beatsPerMeasure;
      setCurrentBeat(beat);

      playClick(beat === 0);

      timerIDRef.current = window.setTimeout(playBeat, beatTime);
    };

    timerIDRef.current = window.setTimeout(playBeat, beatTime);
  };

  const stopMetronome = () => {
    setIsPlaying(false);
    if (timerIDRef.current) {
      clearTimeout(timerIDRef.current);
      timerIDRef.current = null;
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopMetronome();
    } else {
      startMetronome();
    }
  };

  const handleTempoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isPlaying) {
      stopMetronome();
    }

    const newTempo = parseInt(e.target.value);
    setTempo(newTempo);
  };

  const handleBeatsPerMeasureChange = (beats: number) => {
    if (isPlaying) {
      stopMetronome();
    }

    setBeatsPerMeasure(beats);
  };

  const increaseTempo = () => {
    if (isPlaying) {
      stopMetronome();
    }

    const newTempo = Math.min(240, tempo + 1);
    setTempo(newTempo);
  };

  const decreaseTempo = () => {
    if (isPlaying) {
      stopMetronome();
    }
    const newTempo = Math.max(40, tempo - 1);
    setTempo(newTempo);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }

      if (e.code === "ArrowUp") {
        increaseTempo();
      }

      if (e.code === "ArrowDown") {
        decreaseTempo();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPlaying, tempo]);

  useEffect(() => {
    setTempoBpm(tempo.toString());
  }, [tempo]);

  useEffect(() => {
    return () => {
      if (timerIDRef.current) {
        clearTimeout(timerIDRef.current);
      }
    };
  }, []);

  return (
    <div className="container">
      <h1>Metronome</h1>

      <div className="metronome">
        <div className="bpm-display">
          <input
            type="number"
            value={tempoBpm}
            onChange={(e) => {
              if (isPlaying) {
                stopMetronome();
              }
              setTempoBpm(e.target.value);

              const newTempo = parseInt(e.target.value);
              if (!isNaN(newTempo) && newTempo >= 40 && newTempo <= 240) {
                setTempo(newTempo);
              }
            }}
            onBlur={() => {
              const validTempo = Math.max(
                40,
                Math.min(240, parseInt(tempoBpm) || 120)
              );
              setTempo(validTempo);
              setTempoBpm(validTempo.toString());

              if (isPlaying) {
                setTimeout(() => startMetronome(), 10);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
              }
            }}
            min="40"
            max="240"
            className="bpm-input"
          />
          <span className="bpm-label">BPM</span>
        </div>

        <div className="tempo-settings">
          <button className="tempo-button" onClick={decreaseTempo}>
            -
          </button>
          <input
            type="range"
            className="tempo-slider"
            min="40"
            max="240"
            value={tempo}
            onChange={handleTempoChange}
          />
          <button className="tempo-button" onClick={increaseTempo}>
            +
          </button>
        </div>

        <div className="beat-settings">
          <div className="beats-per-measure">
            <label>Time Signature:</label>
            <div className="time-signature-buttons">
              <button
                className={`time-sig-button ${
                  beatsPerMeasure === 2 ? "active" : ""
                }`}
                onClick={() => handleBeatsPerMeasureChange(2)}
              >
                2/4
              </button>
              <button
                className={`time-sig-button ${
                  beatsPerMeasure === 3 ? "active" : ""
                }`}
                onClick={() => handleBeatsPerMeasureChange(3)}
              >
                3/4
              </button>
              <button
                className={`time-sig-button ${
                  beatsPerMeasure === 4 ? "active" : ""
                }`}
                onClick={() => handleBeatsPerMeasureChange(4)}
              >
                4/4
              </button>
              <button
                className={`time-sig-button ${
                  beatsPerMeasure === 5 ? "active" : ""
                }`}
                onClick={() => handleBeatsPerMeasureChange(5)}
              >
                5/4
              </button>
              <button
                className={`time-sig-button ${
                  beatsPerMeasure === 6 ? "active" : ""
                }`}
                onClick={() => handleBeatsPerMeasureChange(6)}
              >
                6/8
              </button>
            </div>
          </div>
        </div>

        <div className="controls">
          <button
            className={`control-button start-button ${
              isPlaying ? "active" : ""
            }`}
            onClick={togglePlay}
          >
            {isPlaying ? "Stop" : "Start"}
          </button>
        </div>

        <div className="visual-indicator">
          <div className="beat-dots">
            {beatDots.map((dot) => (
              <div
                key={dot.id}
                className={`beat-dot ${dot.isAccent ? "accent" : ""} ${
                  currentBeat === dot.id && isPlaying ? "active" : ""
                }`}
                title={dot.isAccent ? "First Beat" : `Beat ${dot.id + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
