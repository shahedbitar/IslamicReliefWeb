import { useState } from "react";
import { X, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import { useEvent } from "@/contexts/EventContext";
import { Portfolio } from "@/contexts/CalendarContext";

interface ExternalsRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  portfolio: Portfolio;
}

export default function ExternalsRequestForm({
  isOpen,
  onClose,
  portfolio,
}: ExternalsRequestFormProps) {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const { createEvent } = useEvent();
  const [formData, setFormData] = useState({
    title: "",
    type: "partnership",
    description: "",
    deadline: "",
    priority: "medium",
  });

  const requestTypes = [
    "Community Partnership",
    "Media Outreach",
    "Event Coordination",
    "Stakeholder Communication",
    "Press Release",
    "Community Engagement",
    "Donor Relations",
    "Other",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create an externals request event
    createEvent({
      title: formData.title,
      description: `Type: ${formData.type}\n\n${formData.description}\n\nDeadline: ${formData.deadline}\nPriority: ${formData.priority}`,
      portfolio,
      createdBy: user?.name || "Unknown",
      status: "in-progress",
      dateTime: formData.deadline || undefined,
      marketingRequested: false,
      externalsNeeded: true,
      externalsComment: `${formData.type}: ${formData.description}`,
    });

    // Notify Externals team
    addNotification({
      type: "task-assigned",
      title: "External Outreach Request Submitted",
      message: `"${formData.title}" from ${portfolio} portfolio has been sent to the Externals team`,
      relatedTo: `externals-request-${Date.now()}`,
    });

    // Reset form
    setFormData({
      title: "",
      type: "partnership",
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
            Request External Outreach
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
          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
            <p className="text-sm text-cyan-900">
              <span className="font-semibold">Submitted from:</span>{" "}
              {portfolio.charAt(0).toUpperCase() + portfolio.slice(1)} Portfolio
            </p>
            <p className="text-sm text-cyan-700 mt-1">
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
              placeholder="e.g., Partner with Local Food Bank"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent"
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
              placeholder="Describe what external outreach support you need..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent resize-none"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent"
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
                    className="w-4 h-4 text-cyan-600"
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
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 transition-colors"
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
            The Externals team will be notified and review your request. You'll
            receive updates in your notifications.
          </p>
        </form>
      </div>
    </div>
  );
}
