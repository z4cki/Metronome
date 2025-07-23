import React, { useState, useEffect } from "react";
import "./GuitarPractice.css";

interface PracticeItem {
  id: number;
  name: string;
  description: string;
  completed: boolean;
}

export const GuitarPractice: React.FC = () => {
  const [practiceItems, setPracticeItems] = useState<PracticeItem[]>([]);
  const [lastResetDate, setLastResetDate] = useState<string>("");

  useEffect(() => {
    const initialPracticeItems: PracticeItem[] = [
      {
        id: 1,
        name: "1-2-3-4 Horizontal Exercise",
        description:
          "Use index, middle, ring, and pinky fingers on the same string at frets 1-2-3-4",
        completed: false,
      },
      {
        id: 2,
        name: "1-3-2-4 Horizontal Exercise",
        description:
          "Use index, middle, ring, and pinky fingers on the same string at frets 1-3-2-4",
        completed: false,
      },
      {
        id: 3,
        name: "Moving Position Exercise",
        description: "Practice 1-2-3-4 and 2-3-4-5 fingerings on one string",
        completed: false,
      },
      {
        id: 4,
        name: "Skip Fret Exercise",
        description:
          "Practice 1-3-2-4 or 1-4-2-3 skipping patterns on one string",
        completed: false,
      },
      {
        id: 5,
        name: "Diagonal Exercise",
        description:
          "Move from low to high strings, shifting one fret right for each string",
        completed: false,
      },
      {
        id: 6,
        name: "Ring-Pinky Finger Exercise",
        description: "Practice 1-4-3-4 and 2-4-3-4 patterns on one string",
        completed: false,
      },
    ];

    const savedItems = localStorage.getItem("guitarPracticeItems");
    const savedDate = localStorage.getItem("guitarPracticeLastReset");

    if (savedItems && savedDate) {
      const currentDate = new Date().toDateString();
      if (savedDate !== currentDate) {
        localStorage.setItem("guitarPracticeLastReset", currentDate);
        localStorage.setItem(
          "guitarPracticeItems",
          JSON.stringify(initialPracticeItems)
        );
        setPracticeItems(initialPracticeItems);
        setLastResetDate(currentDate);
      } else {
        setPracticeItems(JSON.parse(savedItems));
        setLastResetDate(savedDate);
      }
    } else {
      const currentDate = new Date().toDateString();
      localStorage.setItem("guitarPracticeLastReset", currentDate);
      localStorage.setItem(
        "guitarPracticeItems",
        JSON.stringify(initialPracticeItems)
      );
      setPracticeItems(initialPracticeItems);
      setLastResetDate(currentDate);
    }
  }, []);

  const handleCheckboxChange = (id: number) => {
    const updatedItems = practiceItems.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );

    setPracticeItems(updatedItems);
    localStorage.setItem("guitarPracticeItems", JSON.stringify(updatedItems));
  };

  const handleReset = () => {
    const resetItems = practiceItems.map((item) => ({
      ...item,
      completed: false,
    }));
    const currentDate = new Date().toDateString();

    setPracticeItems(resetItems);
    setLastResetDate(currentDate);
    localStorage.setItem("guitarPracticeItems", JSON.stringify(resetItems));
    localStorage.setItem("guitarPracticeLastReset", currentDate);
  };

  const completedCount = practiceItems.filter((item) => item.completed).length;
  const totalCount = practiceItems.length;
  const completionPercentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="guitar-practice-container">
      <h1>Daily Guitar Finger Exercises</h1>

      <div className="practice-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        <div className="progress-text">
          {completedCount}/{totalCount} Completed ({completionPercentage}%)
        </div>
      </div>

      <div className="date-info">
        <p>Last Reset: {new Date(lastResetDate).toLocaleDateString()}</p>
        <button onClick={handleReset} className="reset-button">
          Reset
        </button>
      </div>

      <div className="practice-list">
        {practiceItems.map((item) => (
          <div key={item.id} className="practice-item">
            <div className="practice-checkbox">
              <input
                type="checkbox"
                id={`practice-${item.id}`}
                checked={item.completed}
                onChange={() => handleCheckboxChange(item.id)}
              />
              <label htmlFor={`practice-${item.id}`} className="checkbox-label">
                <span className="checkmark"></span>
              </label>
            </div>
            <div className="practice-content">
              <h3>{item.name}</h3>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
