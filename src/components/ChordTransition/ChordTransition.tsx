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
  // 和弦对列表
  const chordPairs: ChordPair[] = [
    {
      id: 1,
      chord1: "G",
      chord2: "C",
      difficulty: "easy",
      description: "基础开放和弦转换",
    },
    {
      id: 2,
      chord1: "C",
      chord2: "D",
      difficulty: "easy",
      description: "基础开放和弦转换",
    },
    {
      id: 20,
      chord1: "C",
      chord2: "小F",
      difficulty: "easy",
      description: "基础开放和弦转换",
    },
    {
      id: 3,
      chord1: "G",
      chord2: "D",
      difficulty: "easy",
      description: "基础开放和弦转换",
    },
    {
      id: 4,
      chord1: "G",
      chord2: "Em",
      difficulty: "easy",
      description: "大小调和弦转换",
    },
    {
      id: 5,
      chord1: "Am",
      chord2: "E",
      difficulty: "medium",
      description: "小大调和弦转换",
    },
    {
      id: 6,
      chord1: "C",
      chord2: "Am",
      difficulty: "easy",
      description: "关系大小调和弦",
    },
    {
      id: 7,
      chord1: "F",
      chord2: "C",
      difficulty: "medium",
      description: "包含横按的和弦转换",
    },
    {
      id: 8,
      chord1: "D",
      chord2: "A",
      difficulty: "medium",
      description: "手指位置大变动的转换",
    },
    {
      id: 9,
      chord1: "Bm",
      chord2: "G",
      difficulty: "hard",
      description: "横按与开放和弦转换",
    },
    {
      id: 10,
      chord1: "F",
      chord2: "G7",
      difficulty: "medium",
      description: "基础与七和弦转换",
    },
    {
      id: 11,
      chord1: "Cmaj7",
      chord2: "Am7",
      difficulty: "medium",
      description: "大小七和弦转换",
    },
    {
      id: 12,
      chord1: "Em7",
      chord2: "A7",
      difficulty: "medium",
      description: "小七与属七和弦转换",
    },
    {
      id: 13,
      chord1: "D",
      chord2: "Bm",
      difficulty: "medium",
      description: "大三和小三和弦转换",
    },
    {
      id: 14,
      chord1: "F#m",
      chord2: "B",
      difficulty: "hard",
      description: "进阶和弦转换",
    },
    {
      id: 15,
      chord1: "Dm",
      chord2: "G7",
      difficulty: "medium",
      description: "二五和弦进行",
    },
  ];

  // 状态
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

  // Refs
  const timerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const countIntervalRef = useRef<number | null>(null);

  // 筛选和弦对
  const filteredChordPairs =
    selectedDifficulty === "all"
      ? chordPairs
      : chordPairs.filter((pair) => pair.difficulty === selectedDifficulty);

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

  // 播放点击声音
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

  // 开始和弦转换练习
  const startChordTransition = () => {
    if (!activeChordPair) return;

    initAudio();
    setIsPlaying(true);
    setCurrentChord("");

    // 先播放第一拍，设置倒计时为4
    playClick(true);
    setCountdown(4);

    // 倒计时
    let count = 3; // 从3开始，因为我们已经播放了第一拍并显示了4
    countIntervalRef.current = window.setInterval(() => {
      if (count > 0) {
        playClick(false); // 非第一拍没有重音
        setCountdown(count);
        count -= 1;
      } else {
        // 结束倒计时
        if (countIntervalRef.current) {
          clearInterval(countIntervalRef.current);
          countIntervalRef.current = null;
        }
        // 设置倒计时为0，这将触发UI切换到和弦显示
        setCountdown(0);
        startChordSwitch();
      }
    }, (60 / bpm) * 1000);
  };

  // 开始和弦切换
  const startChordSwitch = () => {
    if (!activeChordPair) return;

    // 初始设置为第一个和弦
    setCurrentChord(activeChordPair.chord1);
    playClick(true);

    // 使用变量跟踪是否显示第一个和弦
    // 由于我们已经显示了第一个和弦，所以下一个应该是第二个和弦
    let isFirstChord = true; // 改为 true，因为下一个要显示第二个和弦

    timerRef.current = window.setInterval(() => {
      // 切换和弦状态
      isFirstChord = !isFirstChord;

      // 设置当前和弦
      setCurrentChord(
        isFirstChord ? activeChordPair.chord1 : activeChordPair.chord2
      );

      playClick(true);
    }, (60 / bpm) * 1000);
  };

  // 停止练习
  const stopChordTransition = () => {
    setIsPlaying(false);
    setCurrentChord("");
    setCountdown(4); // 重置倒计时

    // 清除和弦切换定时器
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // 清除倒计时定时器
    if (countIntervalRef.current) {
      clearInterval(countIntervalRef.current);
      countIntervalRef.current = null;
    }
  };

  // 选择和弦对
  const selectChordPair = (pair: ChordPair) => {
    stopChordTransition();
    setActiveChordPair(pair);
  };

  // 组件卸载时清理
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
      <h1>和弦转换练习</h1>

      <div className="control-panel">
        <div className="bpm-control">
          <label htmlFor="bpm-slider">速度 (BPM): {bpm}</label>
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
          <span>难度筛选:</span>
          <div className="filter-buttons">
            <button
              className={selectedDifficulty === "all" ? "active" : ""}
              onClick={() => setSelectedDifficulty("all")}
            >
              全部
            </button>
            <button
              className={selectedDifficulty === "easy" ? "active" : ""}
              onClick={() => setSelectedDifficulty("easy")}
            >
              简单
            </button>
            <button
              className={selectedDifficulty === "medium" ? "active" : ""}
              onClick={() => setSelectedDifficulty("medium")}
            >
              中等
            </button>
            <button
              className={selectedDifficulty === "hard" ? "active" : ""}
              onClick={() => setSelectedDifficulty("hard")}
            >
              困难
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
              <div className="select-prompt">请从下方选择一组和弦进行练习</div>
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
            {isPlaying ? "停止" : "开始"}
          </button>
        </div>
      </div>

      <h2>和弦转换列表</h2>
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
                  ? "简单"
                  : pair.difficulty === "medium"
                  ? "中等"
                  : "困难"}
              </span>
              <span className="chord-description">{pair.description}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="practice-tips">
        <h3>练习提示</h3>
        <ul>
          <li>每次练习专注于两个和弦间的快速、清晰转换</li>
          <li>开始时使用较慢的速度，确保每个音符都能清晰发声</li>
          <li>关注手指位置和移动路径，减少不必要的动作</li>
          <li>逐渐提高速度，挑战自己的极限</li>
          <li>即使不能完全按准，也要保持节奏感</li>
        </ul>
      </div>
    </div>
  );
};
