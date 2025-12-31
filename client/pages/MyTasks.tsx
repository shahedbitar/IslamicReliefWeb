import { useAuth } from "@/contexts/AuthContext";
import { useTask } from "@/contexts/TaskContext";
import AuthHeader from "@/components/AuthHeader";
import { Link } from "react-router-dom";
import { ArrowLeft, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function MyTasks() {
  const { user } = useAuth();
  const { getTasksByAssignee, getOverdueTasks, getTasksDueSoon, updateTaskStatus } = useTask();
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const myTasks = user ? getTasksByAssignee(user.name) : [];
  const overdueTasks = getOverdueTasks().filter((t) => t.assignedTo === user?.name);
  const dueSoonTasks = getTasksDueSoon().filter((t) => t.assignedTo === user?.name);

  const activeTasks = myTasks.filter((t) => t.status !== "done");
  const completedTasks = myTasks.filter((t) => t.status === "done");

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      high: "bg-red-100 text-red-700",
      medium: "bg-yellow-100 text-yellow-700",
      low: "bg-green-100 text-green-700",
    };
    return colors[priority] || "bg-gray-100 text-gray-700";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      todo: "bg-gray-50 border-gray-200",
      "in-progress": "bg-blue-50 border-blue-200",
      review: "bg-purple-50 border-purple-200",
      done: "bg-green-50 border-green-200",
    };
    return colors[status] || "bg-white border-gray-200";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Tasks</h1>
          <p className="text-gray-600">
            Track and manage all your assigned tasks across IRC
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">
                Active Tasks
              </h3>
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{activeTasks.length}</p>
            <p className="text-xs text-gray-500 mt-1">To do & in progress</p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Due Soon</h3>
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {dueSoonTasks.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Next 7 days</p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Completed</h3>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{completedTasks.length}</p>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </div>
        </div>

        {/* Overdue Alert */}
        {overdueTasks.length > 0 && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">
                {overdueTasks.length} Overdue Task{overdueTasks.length !== 1 ? "s" : ""}
              </h3>
              <p className="text-sm text-red-700 mt-1">
                Please complete these as soon as possible
              </p>
            </div>
          </div>
        )}

        {/* Tasks Section */}
        <div className="space-y-8">
          {/* Active Tasks */}
          {activeTasks.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Active Tasks
              </h2>
              <div className="space-y-4">
                {activeTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`bg-white rounded-lg border-l-4 p-6 ${getStatusColor(task.status)} cursor-pointer hover:shadow-lg transition-shadow`}
                    onClick={() => setSelectedTask(task.id)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">
                          {task.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {task.portfolio.charAt(0).toUpperCase() +
                            task.portfolio.slice(1)}{" "}
                          Portfolio
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityBadge(task.priority)}`}
                        >
                          {task.priority.charAt(0).toUpperCase() +
                            task.priority.slice(1)}{" "}
                          Priority
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                          {task.status === "in-progress"
                            ? "In Progress"
                            : task.status === "review"
                              ? "Review"
                              : "To Do"}
                        </span>
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-gray-700 mb-4">{task.description}</p>
                    )}

                    <div className="flex justify-between items-center text-sm">
                      <div className="flex gap-4 text-gray-600">
                        <span>
                          Created by:{" "}
                          <span className="font-semibold">
                            {task.createdBy}
                          </span>
                        </span>
                        {task.comments.length > 0 && (
                          <span>
                            💬{" "}
                            <span className="font-semibold">
                              {task.comments.length} Comment
                              {task.comments.length !== 1 ? "s" : ""}
                            </span>
                          </span>
                        )}
                      </div>
                      {task.dueDate && (
                        <span
                          className={`font-semibold ${
                            new Date(task.dueDate) < new Date()
                              ? "text-red-600"
                              : "text-gray-600"
                          }`}
                        >
                          Due:{" "}
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Status Update Buttons */}
                    <div className="mt-4 flex gap-2 border-t border-gray-200 pt-4">
                      {task.status === "todo" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateTaskStatus(task.id, "in-progress");
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                        >
                          Start Work
                        </button>
                      )}
                      {task.status === "in-progress" && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateTaskStatus(task.id, "review");
                            }}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors"
                          >
                            Submit for Review
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateTaskStatus(task.id, "todo");
                            }}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
                          >
                            Back to To Do
                          </button>
                        </>
                      )}
                      {task.status === "review" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateTaskStatus(task.id, "done");
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Completed Tasks
              </h2>
              <div className="space-y-4">
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-green-50 rounded-lg border border-green-200 p-6 opacity-75"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 line-through">
                          {task.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Completed on{" "}
                          {task.completedAt?.toLocaleDateString()}
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        Done
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {myTasks.length === 0 && (
            <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No tasks yet
              </h3>
              <p className="text-gray-600">
                Tasks will appear here once your VP assigns them to you.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
