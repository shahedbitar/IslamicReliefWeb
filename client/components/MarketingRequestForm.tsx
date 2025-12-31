import { useState } from "react";
import { X, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import { useEvent } from "@/contexts/EventContext";
import { Portfolio } from "@/contexts/CalendarContext";

interface MarketingRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  portfolio: Portfolio;
}

export default function MarketingRequestForm({
  isOpen,
  onClose,
  portfolio,
}: MarketingRequestFormProps) {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const { createEvent } = useEvent();
  const [formData, setFormData] = useState({
    title: "",
    type: "social-media",
    description: "",
    deadline: "",
    priority: "medium",
  });

  const requestTypes = [
    "Social Media Post",
    "Email Campaign",
    "Poster Design",
    "Event Promotion",
    "Content Writing",
    "Graphics Design",
    "Video Content",
    "Other",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create a marketing request event
    createEvent({
      title: formData.title,
      description: `Type: ${formData.type}\n\n${formData.description}\n\nDeadline: ${formData.deadline}\nPriority: ${formData.priority}`,
      portfolio,
      createdBy: user?.name || "Unknown",
      status: "in-progress",
      dateTime: formData.deadline || undefined,
      marketingRequested: true,
      externalsNeeded: false,
    });

    // Notify Marketing team
    addNotification({
      type: "task-assigned",
      title: "Marketing Request Submitted",
      message: `"${formData.title}" from ${portfolio} portfolio has been sent to the Marketing team`,
      relatedTo: `marketing-request-${Date.now()}`,
    });

    // Reset form
    setFormData({
      title: "",
      type: "social-media",
      description: "",
      deadline: "",
      priority: "medium",
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Request Marketing Support
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Portfolio Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Submitted from:</span>{" "}
              {portfolio.charAt(0).toUpperCase() + portfolio.slice(1)} Portfolio
            </p>
            <p className="text-sm text-blue-700 mt-1">
              <span className="font-semibold">By:</span> {user?.name}
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Request Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="e.g., Fall Campaign Social Posts"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Request Type *
            </label>
            <select
              required
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              {requestTypes.map((type) => (
                <option key={type} value={type.toLowerCase().replace(" ", "-")}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Description *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe what you need from the marketing team..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
            />
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Needed By *
            </label>
            <input
              type="date"
              required
              value={formData.deadline}
              onChange={(e) =>
                setFormData({ ...formData, deadline: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Priority
            </label>
            <div className="flex gap-4">
              {["low", "medium", "high"].map((priority) => (
                <label key={priority} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="priority"
                    value={priority}
                    checked={formData.priority === priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700 capitalize">
                    {priority}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <Send className="w-4 h-4" />
              Submit Request
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Info */}
          <p className="text-xs text-gray-500 text-center">
            The Marketing team will be notified and review your request. You'll
            receive updates in your notifications.
          </p>
        </form>
      </div>
    </div>
  );
}
