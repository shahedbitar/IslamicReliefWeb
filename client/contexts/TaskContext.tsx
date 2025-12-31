import React, { createContext, useContext, useState } from "react";
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

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "t1",
      title: "Design Social Media Posts",
      description: "Create 5 Instagram posts for the Halal Food Bank Drive",
      portfolio: "marketing",
      createdBy: "Hassan Ibrahim",
      assignedTo: "Amir Khan",
      status: "in-progress",
      priority: "high",
      category: "content",
      dueDate: "2024-06-10",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      comments: [
        {
          id: "c1",
          author: "Amir Khan",
          authorRole: "Team Member",
          text: "Started working on the designs. Will have first draft by tomorrow.",
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        },
      ],
      attachments: [],
    },
    {
      id: "t2",
      title: "Prepare Booth Setup List",
      description: "Create a checklist of items needed for the Clubs Week booth",
      portfolio: "events",
      createdBy: "Sarah Ahmed",
      assignedTo: "Amir Khan",
      status: "todo",
      priority: "medium",
      category: "logistics",
      dueDate: "2024-06-08",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      comments: [],
      attachments: [],
    },
    {
      id: "t3",
      title: "Send Follow-up Emails",
      description: "Contact 10 local businesses for sponsorship opportunities",
      portfolio: "externals",
      createdBy: "Layla Hassan",
      assignedTo: "Amir Khan",
      status: "todo",
      priority: "high",
      category: "outreach",
      dueDate: "2024-06-12",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      comments: [],
      attachments: [],
    },
    {
      id: "t4",
      title: "Finalize Donation Drive Details",
      description: "Coordinate with team for the upcoming donation drive",
      portfolio: "charity",
      createdBy: "Fatima Malik",
      assignedTo: "Amir Khan",
      status: "done",
      priority: "high",
      dueDate: "2024-06-05",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      comments: [],
      attachments: [],
    },
  ]);

  const createTask = (
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "comments" | "attachments">
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
          : task
      )
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
        task.status !== "done"
    );
  };

  const getTasksDueSoon = (): Task[] => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return tasks.filter(
      (task) =>
        task.dueDate &&
        new Date(task.dueDate) >= today &&
        new Date(task.dueDate) <= nextWeek &&
        task.status !== "done"
    );
  };

  const addComment = (
    taskId: string,
    commentData: Omit<TaskComment, "id" | "timestamp">
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
          : task
      )
    );
  };

  const addAttachment = (
    taskId: string,
    attachmentData: Omit<TaskAttachment, "id" | "uploadedAt">
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
          : task
      )
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
          : task
      )
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
