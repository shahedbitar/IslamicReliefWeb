import { useState } from "react";
import { useTask, TaskStatus } from "@/contexts/TaskContext";
import { ChevronDown, Trash2, MessageCircle, Paperclip } from "lucide-react";
import { Portfolio } from "@/contexts/CalendarContext";

interface TaskBoardProps {
  portfolio: Portfolio;
  isVP: boolean;
  userName?: string;
  onTaskClick?: (taskId: string) => void;
}

export default function TaskBoard({
  portfolio,
  isVP,
  userName,
  onTaskClick,
}: TaskBoardProps) {
  const { getTasksByPortfolio, getTasksByAssignee, updateTaskStatus, deleteTask } = useTask();
  const [filterBy, setFilterBy] = useState<"all" | "assigned-to-me" | "unassigned">(
    isVP ? "all" : "assigned-to-me"
  );

  const allPortfolioTasks = getTasksByPortfolio(portfolio);
  const myTasks = userName ? getTasksByAssignee(userName) : [];

  const tasks = isVP
    ? filterBy === "all"
      ? allPortfolioTasks
      : allPortfolioTasks
    : myTasks;

  const todoTasks = tasks.filter((t) => t.status === "todo");
  const inProgressTasks = tasks.filter((t) => t.status === "in-progress");
  const reviewTasks = tasks.filter((t) => t.status === "review");
  const doneTasks = tasks.filter((t) => t.status === "done");

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-4 border-l-red-500 bg-red-50";
      case "medium":
        return "border-l-4 border-l-yellow-500 bg-yellow-50";
      case "low":
        return "border-l-4 border-l-green-500 bg-green-50";
      default:
        return "border-l-4 border-l-gray-500";
    }
  };

  const TaskCard = ({ task }: { task: any }) => (
    <div
      className={`p-4 rounded-lg border border-gray-200 ${getPriorityColor(task.priority)} cursor-pointer hover:shadow-md transition-shadow group`}
      onClick={() => onTaskClick?.(task.id)}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-gray-900 text-sm flex-1">{task.title}</h4>
        {isVP && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteTask(task.id);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity"
            title="Delete task"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        )}
      </div>

      {task.description && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex justify-between items-end mb-2">
        <span className="text-xs font-semibold text-gray-700 bg-white px-2 py-1 rounded">
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
        {!isVP && (
          <span className="text-xs text-gray-500">by {task.createdBy}</span>
        )}
      </div>

      {isVP && (
        <p className="text-xs text-gray-600 mb-2">
          <span className="font-semibold">Assigned to:</span> {task.assignedTo}
        </p>
      )}

      {task.dueDate && (
        <p className="text-xs text-gray-500 mb-3">
          Due: {new Date(task.dueDate).toLocaleDateString()}
        </p>
      )}

      <div className="flex gap-4 text-xs text-gray-500 border-t border-gray-200 pt-3">
        <span className="flex items-center gap-1">
          <MessageCircle className="w-3 h-3" />
          {task.comments.length}
        </span>
        <span className="flex items-center gap-1">
          <Paperclip className="w-3 h-3" />
          {task.attachments.length}
        </span>
      </div>
    </div>
  );

  const Column = ({
    status,
    title,
    tasks,
  }: {
    status: TaskStatus;
    title: string;
    tasks: any[];
  }) => (
    <div className="bg-gray-50 rounded-lg p-4 flex-1 min-w-80">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-900">
          {title} ({tasks.length})
        </h3>
      </div>
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p className="text-sm">No tasks</p>
          </div>
        ) : (
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  );

  return (
    <div>
      {/* Filters */}
      {isVP && (
        <div className="mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilterBy("all")}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filterBy === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              All Tasks
            </button>
            <button
              onClick={() => setFilterBy("unassigned")}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filterBy === "unassigned"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              Unassigned
            </button>
          </div>
        </div>
      )}

      {/* Board */}
      <div className="flex gap-6 overflow-x-auto pb-4">
        <Column status="todo" title="To Do" tasks={todoTasks} />
        <Column
          status="in-progress"
          title="In Progress"
          tasks={inProgressTasks}
        />
        <Column status="review" title="Review" tasks={reviewTasks} />
        <Column status="done" title="Done" tasks={doneTasks} />
      </div>
    </div>
  );
}
