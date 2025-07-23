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

  // 初始化练习项目
  useEffect(() => {
    const initialPracticeItems: PracticeItem[] = [
      {
        id: 1,
        name: "1-2-3-4 横向爬格子",
        description: "使用食指、中指、无名指和小指在同一弦上按1-2-3-4品位",
        completed: false,
      },
      {
        id: 2,
        name: "1-3-2-4 横向爬格子",
        description: "使用食指、中指、无名指和小指在同一弦上按1-3-2-4品位",
        completed: false,
      },
      {
        id: 3,
        name: "移动一格爬格子",
        description: "在一弦上练习1-2-3-4和2-3-4-5等移动指法",
        completed: false,
      },
      {
        id: 4,
        name: "跳格爬格子",
        description: "在一弦上练习1-3-2-4或1-4-2-3等跳跃指法",
        completed: false,
      },
      {
        id: 5,
        name: "斜向爬格子",
        description: "从低音弦到高音弦，每向上一弦向右移动一品",
        completed: false,
      },
      {
        id: 6,
        name: "无名指小指爬格子",
        description: "在一弦上练习1-4-3-4 和 2-4-3-4爬格子",
        completed: false,
      },
    ];

    // 从本地存储获取练习项目
    const savedItems = localStorage.getItem("guitarPracticeItems");
    const savedDate = localStorage.getItem("guitarPracticeLastReset");

    if (savedItems && savedDate) {
      // 检查是否需要重置（新的一天）
      const currentDate = new Date().toDateString();
      if (savedDate !== currentDate) {
        // 新的一天，重置所有项目
        localStorage.setItem("guitarPracticeLastReset", currentDate);
        localStorage.setItem(
          "guitarPracticeItems",
          JSON.stringify(initialPracticeItems)
        );
        setPracticeItems(initialPracticeItems);
        setLastResetDate(currentDate);
      } else {
        // 同一天，加载保存的状态
        setPracticeItems(JSON.parse(savedItems));
        setLastResetDate(savedDate);
      }
    } else {
      // 首次运行，初始化
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

  // 处理复选框更改
  const handleCheckboxChange = (id: number) => {
    const updatedItems = practiceItems.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );

    setPracticeItems(updatedItems);
    localStorage.setItem("guitarPracticeItems", JSON.stringify(updatedItems));
  };

  // 手动重置所有项目
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

  // 计算完成的项目数量
  const completedCount = practiceItems.filter((item) => item.completed).length;
  const totalCount = practiceItems.length;
  const completionPercentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="guitar-practice-container">
      <h1>吉他爬格子日常练习</h1>

      <div className="practice-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        <div className="progress-text">
          {completedCount}/{totalCount} 完成 ({completionPercentage}%)
        </div>
      </div>

      <div className="date-info">
        <p>上次重置: {new Date(lastResetDate).toLocaleDateString()}</p>
        <button onClick={handleReset} className="reset-button">
          手动重置
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
