import { useState, useEffect, useRef, type ReactNode } from "react";
import "./DailyTasks.css";
import React from "react"; // Added for React.isValidElement

interface Task {
  id: number;
  title: string;
  description: string | string[] | ReactNode[];
  duration: number; // in minutes
  completed: boolean;
  timerId?: number;
  timeLeft?: number; // in seconds
  isRunning?: boolean;
  alarmActive?: boolean;
}

export const DailyTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: "Open String Picking",
      description: ["53231323", "53(12)3", "532123"],
      duration: 5,
      completed: false,
      timeLeft: 5 * 60,
      isRunning: false,
      alarmActive: false,
    },
    {
      id: 2,
      title: "Scale Practice",
      description: [
        <div className="hover-image-container" key="scales-tooltip">
          <span className="hover-text">La</span>
          <div className="hover-image">
            <img src="/images/La.png" alt="Scale Diagram" />
          </div>
        </div>,
      ],
      duration: 15,
      completed: false,
      timeLeft: 15 * 60,
      isRunning: false,
      alarmActive: false,
    },
    {
      id: 3,
      title: "Finger Exercise",
      description: [
        "1234-1234-1234",
        "4321-4321-4321",
        "1234-2345-3456",
        "6543-5432-4321",
        "1324-1324-1324",
        "4231-4231-4231",
        "1434-2434-3424",
        "Cross-string-1(2)34-1(2)3(4)",
      ],
      duration: 15,
      completed: false,
      timeLeft: 15 * 60,
      isRunning: false,
      alarmActive: false,
    },
    {
      id: 4,
      title: "Chord Transitions",
      description: [
        "C-G-C-G",
        "C-Fm-C-Fm",
        "G-Fm-G-Fm",
        "Am-Em-Am-Em",
        "Dm-Em-Dm-Em",
        "Em-Dm-Em-Dm",
      ],
      duration: 15,
      completed: false,
      timeLeft: 15 * 60,
      isRunning: false,
      alarmActive: false,
    },
  ]);

  const defaultTasks = useRef<Task[]>(tasks);
  const [lastSavedDate, setLastSavedDate] = useState<string>("");

  // Use ref for audio to avoid recreation
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Track elapsed time with ref to avoid state updates causing re-renders
  const timerRefs = useRef<{
    [key: number]: { startTime: number; pausedTimeLeft: number };
  }>({});

  // Load tasks from localStorage and check if we need to reset based on date
  useEffect(() => {
    const loadSavedTasks = () => {
      try {
        // Load the last saved date
        const savedDate = localStorage.getItem("lastSavedDate");
        const today = new Date().toDateString();
        setLastSavedDate(savedDate || "");

        // If it's a new day or no saved data, reset tasks
        if (!savedDate || savedDate !== today) {
          // It's a new day, reset tasks
          localStorage.setItem("lastSavedDate", today);
          localStorage.removeItem("savedTasks");
          return defaultTasks.current;
        }

        // Otherwise load saved tasks state
        const savedTasks = localStorage.getItem("savedTasks");
        if (savedTasks) {
          // We need to parse the tasks but handle ReactNode elements specially
          const parsedTasks: Task[] = JSON.parse(savedTasks, (key, value) => {
            // If we're parsing description and it contains a ReactNode (indicated by a marker)
            if (key === "description" && Array.isArray(value)) {
              return value.map((desc) => {
                if (typeof desc === "object" && desc && desc.__isReactNode) {
                  // Recreate the React component for task 2 (爬音阶)
                  return (
                    <div className="hover-image-container" key="scales-tooltip">
                      <span className="hover-text">La</span>
                      <div className="hover-image">
                        <img src="/images/La.png" alt="音阶图示" />
                      </div>
                    </div>
                  );
                }
                return desc;
              });
            }
            return value;
          });

          return parsedTasks;
        }
      } catch (error) {
        console.error("Error loading tasks from localStorage:", error);
      }

      return defaultTasks.current;
    };

    const savedTasks = loadSavedTasks();
    setTasks(savedTasks);
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    // Don't save if we haven't loaded the initial state yet
    if (!lastSavedDate) return;

    try {
      // We need to serialize tasks but handle ReactNode elements specially
      const tasksToSave = tasks.map((task) => {
        if (Array.isArray(task.description)) {
          return {
            ...task,
            // Mark ReactNode elements with a flag so we can reconstruct them later
            description: task.description.map((desc) => {
              if (React.isValidElement(desc)) {
                return { __isReactNode: true, id: task.id };
              }
              return desc;
            }),
            // Don't save timer IDs
            timerId: undefined,
          };
        }
        return { ...task, timerId: undefined };
      });

      localStorage.setItem("savedTasks", JSON.stringify(tasksToSave));
      localStorage.setItem("lastSavedDate", new Date().toDateString());
    } catch (error) {
      console.error("Error saving tasks to localStorage:", error);
    }
  }, [tasks, lastSavedDate]);

  useEffect(() => {
    // Create audio instance once
    audioRef.current = new Audio("/audio/alarm.mp3");
    audioRef.current.loop = true;

    // Cleanup function to stop any alarms and timers
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      tasks.forEach((task) => {
        if (task.timerId) {
          clearInterval(task.timerId);
        }
      });
    };
  }, []); // Empty dependency array so it only runs once

  const completedTasksCount = tasks.filter((task) => task.completed).length;
  const progressPercentage = (completedTasksCount / tasks.length) * 100;

  // Function to manually reset all tasks to initial state
  const resetAllTasks = () => {
    const resetTasks = defaultTasks.current.map((task) => ({
      ...task,
      completed: false,
      isRunning: false,
      alarmActive: false,
      timeLeft: task.duration * 60,
      timerId: undefined,
    }));

    setTasks(resetTasks);
    localStorage.setItem("lastSavedDate", new Date().toDateString());
    localStorage.setItem("savedTasks", JSON.stringify(resetTasks));
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const startTimer = (taskId: number) => {
    const now = Date.now();

    setTasks((prevTasks) => {
      const taskToStart = prevTasks.find((t) => t.id === taskId);
      if (!taskToStart) return prevTasks;

      // Get the current timeLeft value
      const timeLeftValue = taskToStart.timeLeft || 0;

      // Set up timer reference data
      timerRefs.current[taskId] = {
        startTime: now,
        pausedTimeLeft: timeLeftValue,
      };

      return prevTasks.map((task) => {
        if (task.id === taskId) {
          // Clear any existing timer
          if (task.timerId) {
            clearInterval(task.timerId);
          }

          // Create new timer
          const timerId = window.setInterval(() => {
            const timerData = timerRefs.current[taskId];
            if (!timerData) return;

            const elapsedSeconds = Math.floor(
              (Date.now() - timerData.startTime) / 1000
            );
            const newTimeLeft = Math.max(
              0,
              timerData.pausedTimeLeft - elapsedSeconds
            );

            setTasks((currentTasks) => {
              const currentTask = currentTasks.find((t) => t.id === taskId);

              // Don't update if task is no longer running or already has this time
              if (!currentTask || !currentTask.isRunning) return currentTasks;

              // Only update if time has actually changed
              if (currentTask.timeLeft === newTimeLeft) return currentTasks;

              return currentTasks.map((t) => {
                if (t.id === taskId) {
                  // Handle time's up
                  if (newTimeLeft <= 0 && !t.alarmActive && !t.completed) {
                    // Clear the timer
                    clearInterval(t.timerId);

                    // Play alarm sound
                    if (audioRef.current) {
                      audioRef.current.currentTime = 0;
                      audioRef.current
                        .play()
                        .catch((err) =>
                          console.error("Error playing alarm:", err)
                        );
                    }

                    // Update task state
                    return {
                      ...t,
                      timeLeft: 0,
                      isRunning: false,
                      alarmActive: true,
                      timerId: undefined,
                    };
                  }

                  // Regular time update
                  return { ...t, timeLeft: newTimeLeft };
                }
                return t;
              });
            });
          }, 500); // Update every half second

          return { ...task, isRunning: true, timerId };
        }
        return task;
      });
    });
  };

  const pauseTimer = (taskId: number) => {
    setTasks((prevTasks) => {
      const taskToPause = prevTasks.find((t) => t.id === taskId);
      if (!taskToPause || !taskToPause.isRunning) return prevTasks;

      // Calculate current time left and store it
      const timerData = timerRefs.current[taskId];
      if (timerData) {
        const elapsedSeconds = Math.floor(
          (Date.now() - timerData.startTime) / 1000
        );
        const currentTimeLeft = Math.max(
          0,
          timerData.pausedTimeLeft - elapsedSeconds
        );
        timerData.pausedTimeLeft = currentTimeLeft;
      }

      return prevTasks.map((task) => {
        if (task.id === taskId) {
          // Ensure we clear the timer
          if (task.timerId) {
            clearInterval(task.timerId);
          }

          // Get the actual current time left based on elapsed time
          const newTimeLeft = timerData
            ? timerData.pausedTimeLeft
            : task.timeLeft;

          return {
            ...task,
            isRunning: false,
            timeLeft: newTimeLeft,
            timerId: undefined,
          };
        }
        return task;
      });
    });
  };

  const resetTimer = (taskId: number) => {
    // Stop alarm sound first if it's playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Reset the timer reference data
    if (timerRefs.current[taskId]) {
      delete timerRefs.current[taskId];
    }

    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          // Ensure we clear any existing timer
          if (task.timerId) {
            clearInterval(task.timerId);
          }

          // Reset to initial duration in seconds
          const resetTimeLeft = task.duration * 60;

          return {
            ...task,
            timeLeft: resetTimeLeft,
            isRunning: false,
            timerId: undefined,
            completed: false,
            alarmActive: false,
          };
        }
        return task;
      })
    );
  };

  const stopAlarm = (taskId: number) => {
    // Stop alarm sound first
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Then update task state
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((task) => {
        if (task.id === taskId) {
          if (task.timerId) {
            clearInterval(task.timerId);
          }
          return {
            ...task,
            alarmActive: false,
            completed: true,
            timerId: undefined,
          };
        }
        return task;
      });

      return updatedTasks;
    });
  };

  return (
    <div className="daily-tasks">
      <div className="progress-container">
        <div className="progress-bar">
          <div
            className="progress"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="progress-text">
          {completedTasksCount} of {tasks.length} tasks completed
        </div>
      </div>

      <ul className="task-list">
        {tasks.map((task) => (
          <li
            key={task.id}
            className={`task-item ${task.completed ? "completed" : ""} ${
              task.alarmActive ? "alarm-active" : ""
            }`}
          >
            <div className="task-content">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => {
                  if (!task.completed) {
                    // If timer is running, stop it
                    if (task.isRunning && task.timerId) {
                      clearInterval(task.timerId);
                    }
                    setTasks((prevTasks) =>
                      prevTasks.map((t) =>
                        t.id === task.id
                          ? { ...t, completed: true, isRunning: false }
                          : t
                      )
                    );
                  } else {
                    setTasks((prevTasks) =>
                      prevTasks.map((t) =>
                        t.id === task.id ? { ...t, completed: false } : t
                      )
                    );
                  }
                }}
              />
              <div className="task-details">
                <span className="task-title">
                  {task.title} - {task.duration} min
                </span>
                <span className="task-description">
                  {Array.isArray(task.description) ? (
                    <div className="description-list">
                      {task.description.map((desc, index) => (
                        <div key={index} className="description-item">
                          <span className="description-bullet">•</span>
                          <span>{desc}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    task.description
                  )}
                </span>
              </div>
            </div>

            <div className="task-timer">
              {task.alarmActive ? (
                <button
                  className="stop-alarm-btn"
                  onClick={() => stopAlarm(task.id)}
                >
                  Stop Alarm
                </button>
              ) : (
                <>
                  <div className="timer-display">
                    {formatTime(task.timeLeft || 0)}
                  </div>
                  <div className="timer-controls">
                    {!task.isRunning ? (
                      <button
                        className="start-btn"
                        onClick={() => startTimer(task.id)}
                        disabled={task.completed}
                      >
                        Start
                      </button>
                    ) : (
                      <button
                        className="pause-btn"
                        onClick={() => pauseTimer(task.id)}
                      >
                        Pause
                      </button>
                    )}
                    <button
                      className="reset-btn"
                      onClick={() => resetTimer(task.id)}
                    >
                      Reset
                    </button>
                  </div>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
      <button className="reset-all-btn" onClick={resetAllTasks}>
        Reset All Tasks
      </button>
    </div>
  );
};
