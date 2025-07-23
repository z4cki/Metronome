import { useState, useEffect, useRef } from "react";
import { useBeatVisualization } from "../../hooks/useBeatVisualization";
import "./Metronome.css";

export const Metronome: React.FC = () => {
  // 状态
  const [tempo, setTempo] = useState<number>(60);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState<number>(4);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentBeat, setCurrentBeat] = useState<number>(0);
  const [tempoBpm, setTempoBpm] = useState<string>(tempo.toString());

  // 拍点
  const { beatDots } = useBeatVisualization(beatsPerMeasure);

  // Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerIDRef = useRef<number | null>(null);

  // 初始化音频上下文
  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
  };

  // 播放声音
  const playClick = (isAccent: boolean) => {
    if (!audioContextRef.current) return;

    const osc = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    if (isAccent) {
      // 第一拍使用明显不同的声音
      osc.frequency.value = 1500; // 更高的音调
      gainNode.gain.value = 0.7; // 更大的音量

      // 创建额外的振荡器，增加声音的丰富度
      const osc2 = audioContextRef.current.createOscillator();
      const gainNode2 = audioContextRef.current.createGain();

      osc2.frequency.value = 1000; // 低频增加厚度
      gainNode2.gain.value = 0.5;

      osc2.connect(gainNode2);
      gainNode2.connect(audioContextRef.current.destination);

      osc2.start();
      osc2.stop(audioContextRef.current.currentTime + 0.08);
    } else {
      osc.frequency.value = 700; // 普通拍子的音调
      gainNode.gain.value = 0.5;
    }

    osc.start();
    osc.stop(audioContextRef.current.currentTime + (isAccent ? 0.08 : 0.05));
  };

  // 开始播放节拍器
  const startMetronome = () => {
    initAudio();
    setIsPlaying(true);
    setCurrentBeat(0);

    // 计算每拍的间隔时间（毫秒）
    const beatTime = (60 / tempo) * 1000;

    // 播放第一拍
    playClick(true);

    // 设置定时器循环播放后续拍子
    let beat = 0;

    const playBeat = () => {
      // 更新当前拍子
      beat = (beat + 1) % beatsPerMeasure;
      setCurrentBeat(beat);

      // 播放声音
      playClick(beat === 0);

      // 设置下一拍
      timerIDRef.current = window.setTimeout(playBeat, beatTime);
    };

    // 设置第一拍之后的拍子
    timerIDRef.current = window.setTimeout(playBeat, beatTime);
  };

  // 停止节拍器
  const stopMetronome = () => {
    setIsPlaying(false);
    if (timerIDRef.current) {
      clearTimeout(timerIDRef.current);
      timerIDRef.current = null;
    }
  };

  // 切换播放/停止
  const togglePlay = () => {
    if (isPlaying) {
      stopMetronome();
    } else {
      startMetronome();
    }
  };

  // 处理速度改变
  const handleTempoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isPlaying) {
      stopMetronome();
    }

    const newTempo = parseInt(e.target.value);
    setTempo(newTempo);
  };

  // 处理拍号改变
  const handleBeatsPerMeasureChange = (beats: number) => {
    // 如果正在播放，重置当前拍子并重启节拍器
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

      // 上/下箭头调整速度
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

  // 添加一个 useEffect 来同步 tempo 到 tempoBpm
  useEffect(() => {
    setTempoBpm(tempo.toString());
  }, [tempo]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (timerIDRef.current) {
        clearTimeout(timerIDRef.current);
      }
    };
  }, []);

  return (
    <div className="container">
      <h1>节拍器</h1>

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
              // 当输入框失去焦点时，确保显示的是有效值
              const validTempo = Math.max(
                40,
                Math.min(240, parseInt(tempoBpm) || 120)
              );
              setTempo(validTempo);
              setTempoBpm(validTempo.toString());

              // 如果之前在播放，重新启动节拍器
              if (isPlaying) {
                setTimeout(() => startMetronome(), 10);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur(); // 失去焦点，触发 onBlur
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
            <label>拍号:</label>
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
            {isPlaying ? "停止" : "开始"}
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
                title={dot.isAccent ? "第一拍" : `第 ${dot.id + 1} 拍`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
