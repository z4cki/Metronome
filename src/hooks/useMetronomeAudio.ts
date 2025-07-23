import { useRef, useCallback } from "react";

interface UseMetronomeAudioReturn {
  initializeAudio: () => void;
  playClick: (time: number, isAccent: boolean) => void;
  getAudioTime: () => number;
  isAudioContextInitialized: () => boolean;
}

export function useMetronomeAudio(): UseMetronomeAudioReturn {
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context
  const initializeAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }

    // Resume audio context if it was suspended
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
  }, []);

  // Play click sound
  const playClick = useCallback((time: number, isAccent: boolean) => {
    if (!audioContextRef.current) return;

    const osc = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    // Different sounds for accented and regular beats
    if (isAccent) {
      // 第一拍使用明显不同的声音
      osc.frequency.value = 1200; // 更高的音调
      gainNode.gain.value = 0.7; // 更大的音量

      // 创建额外的振荡器，增加声音的丰富度
      const osc2 = audioContextRef.current.createOscillator();
      const gainNode2 = audioContextRef.current.createGain();

      osc2.frequency.value = 600; // 低频增加厚度
      gainNode2.gain.value = 0.3;

      osc2.connect(gainNode2);
      gainNode2.connect(audioContextRef.current.destination);

      osc2.start(time);
      osc2.stop(time + 0.08); // 持续时间略长
    } else {
      osc.frequency.value = 800; // 普通拍子的音调
      gainNode.gain.value = 0.3;
    }

    osc.start(time);
    osc.stop(time + (isAccent ? 0.08 : 0.05)); // 第一拍持续时间略长
  }, []);

  // Get current audio context time
  const getAudioTime = useCallback(() => {
    return audioContextRef.current ? audioContextRef.current.currentTime : 0;
  }, []);

  // Check if audio context is initialized
  const isAudioContextInitialized = useCallback(() => {
    return audioContextRef.current !== null;
  }, []);

  return {
    initializeAudio,
    playClick,
    getAudioTime,
    isAudioContextInitialized,
  };
}
