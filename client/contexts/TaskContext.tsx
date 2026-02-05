import React, { createContext, useContext, useEffect, useState } from "react";
import { Portfolio } from "./CalendarContext";

export type TaskStatus = "todo" | "in-progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface TaskComment {
  id: string;
  author: string;
  authorRole: string;
  text: string;
  timestamp: Date;
}

export interface TaskAttachment {
  id: string;
  name: string;
  type: string;
  uploadedBy: string;
  uploadedAt: Date;
  url?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  portfolio: Portfolio;
  createdBy: string; // VP name
  assignedTo: string; // Team member name
  status: TaskStatus;
  priority: TaskPriority;
  category?: string;
  dueDate?: string;
  createdAt: Date;
  updatedAt: Date;
  comments: TaskComment[];
  attachments: TaskAttachment[];
  completedAt?: Date;
}

interface TaskContextType {
  tasks: Task[];
  createTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt" | "comments" | "attachments">) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getTasksByPortfolio: (portfolio: Portfolio) => Task[];
  getTasksByAssignee: (assignee: string) => Task[];
  getTasksByVP: (vp: string) => Task[];
  getOverdueTasks: () => Task[];
  getTasksDueSoon: () => Task[];
  addComment: (taskId: string, comment: Omit<TaskComment, "id" | "timestamp">) => void;
  addAttachment: (taskId: string, attachment: Omit<TaskAttachment, "id" | "uploadedAt">) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
}

const TASK_STORAGE_KEY = "irc_tasks";

const TaskContext = createContext<TaskContextType | undefined>(undefined);

function hydrateTask(raw: Task & {
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  comments: Array<TaskComment & { timestamp: string }>;
  attachments: Array<TaskAttachment & { uploadedAt: string }>;
}): Task {
  return {
    ...raw,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
    completedAt: raw.completedAt ? new Date(raw.completedAt) : undefined,
    comments: raw.comments.map((comment) => ({
      ...comment,
      timestamp: new Date(comment.timestamp),
    })),
    attachments: raw.attachments.map((attachment) => ({
      ...attachment,
      uploadedAt: new Date(attachment.uploadedAt),
    })),
  };
}

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const stored = localStorage.getItem(TASK_STORAGE_KEY);
    if (!stored) return [];

    try {
      const parsed = JSON.parse(stored) as Array<
        Task & {
          createdAt: string;
          updatedAt: string;
          completedAt?: string;
          comments: Array<TaskComment & { timestamp: string }>;
          attachments: Array<TaskAttachment & { uploadedAt: string }>;
        }
      >;
      return parsed.map(hydrateTask);
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const createTask = (
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "comments" | "attachments">,
  ): Task => {
    const newTask: Task = {
      ...taskData,
      id: `t${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      comments: [],
      attachments: [],
    };
    setTasks((prev) => [...prev, newTask]);
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, ...updates, updatedAt: new Date() }
          : task,
      ),
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const getTasksByPortfolio = (portfolio: Portfolio): Task[] => {
    return tasks.filter((task) => task.portfolio === portfolio);
  };

  const getTasksByAssignee = (assignee: string): Task[] => {
    return tasks.filter((task) => task.assignedTo === assignee);
  };

  const getTasksByVP = (vp: string): Task[] => {
    return tasks.filter((task) => task.createdBy === vp);
  };

  const getOverdueTasks = (): Task[] => {
    const today = new Date().toISOString().split("T")[0];
    return tasks.filter(
      (task) =>
        task.dueDate &&
        task.dueDate < today &&
        task.status !== "done",
    );
  };

  const getTasksDueSoon = (): Task[] => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return tasks.filter(
      (task) =>
        task.dueDate &&
        new Date(task.dueDate) >= today &&
        new Date(task.dueDate) <= nextWeek &&
        task.status !== "done",
    );
  };

  const addComment = (
    taskId: string,
    commentData: Omit<TaskComment, "id" | "timestamp">,
  ) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              comments: [
                ...task.comments,
                {
                  ...commentData,
                  id: `cm${Date.now()}`,
                  timestamp: new Date(),
                },
              ],
              updatedAt: new Date(),
            }
          : task,
      ),
    );
  };

  const addAttachment = (
    taskId: string,
    attachmentData: Omit<TaskAttachment, "id" | "uploadedAt">,
  ) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              attachments: [
                ...task.attachments,
                {
                  ...attachmentData,
                  id: `at${Date.now()}`,
                  uploadedAt: new Date(),
                },
              ],
              updatedAt: new Date(),
            }
          : task,
      ),
    );
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status,
              completedAt: status === "done" ? new Date() : undefined,
              updatedAt: new Date(),
            }
          : task,
      ),
    );
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        createTask,
        updateTask,
        deleteTask,
        getTasksByPortfolio,
        getTasksByAssignee,
        getTasksByVP,
        getOverdueTasks,
        getTasksDueSoon,
        addComment,
        addAttachment,
        updateTaskStatus,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTask must be used within TaskProvider");
  }
  return context;
};
