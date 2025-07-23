import { useState, useEffect } from "react";

export interface BeatDot {
  id: number;
  isAccent: boolean;
}

interface UseBeatVisualizationReturn {
  beatDots: BeatDot[];
}

export function useBeatVisualization(
  beatsPerMeasure: number
): UseBeatVisualizationReturn {
  const [beatDots, setBeatDots] = useState<BeatDot[]>([]);

  // Initialize beat dots when beatsPerMeasure changes
  useEffect(() => {
    const newBeatDots: BeatDot[] = [];
    for (let i = 0; i < beatsPerMeasure; i++) {
      newBeatDots.push({
        id: i,
        isAccent: i === 0, // First beat is accented
      });
    }
    setBeatDots(newBeatDots);
  }, [beatsPerMeasure]);

  return {
    beatDots,
  };
}
