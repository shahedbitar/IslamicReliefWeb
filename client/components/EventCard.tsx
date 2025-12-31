import { useState } from "react";
import { Event, useEvent } from "@/contexts/EventContext";
import { ChevronDown, ChevronUp, Check } from "lucide-react";

interface EventCardProps {
  event: Event;
  onStatusChange?: (newStatus: "in-progress" | "ready") => void;
}

export default function EventCard({ event, onStatusChange }: EventCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showExternalsComment, setShowExternalsComment] = useState(false);
  const { updateChecklistItem, updateEventStatus, canMarkReady, updateExternalsComment } = useEvent();

  const externalsItem = event.checklist.find(item =>
    item.label.includes("Externals request")
  );

  const completedItems = event.checklist.filter(item => item.completed).length;
  const totalItems = event.checklist.length;
  const completionPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const isReady = canMarkReady(event.id);

  const handleMarkReady = () => {
    if (isReady) {
      updateEventStatus(event.id, "ready");
      onStatusChange?.("ready");
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{event.title}</h3>
            {event.description && (
              <p className="text-sm text-gray-600 mt-1">{event.description}</p>
            )}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-4 p-1 hover:bg-gray-100 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Meta Information */}
        <div className="flex flex-wrap gap-3 text-sm">
          {event.dateTime && (
            <div className="flex items-center gap-1 text-gray-600">
              <span className="font-medium">📅</span>
              <span>{event.dateTime}</span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-1 text-gray-600">
              <span className="font-medium">📍</span>
              <span>{event.location}</span>
            </div>
          )}
          {event.budget ? (
            <div className="flex items-center gap-1 text-gray-600">
              <span className="font-medium">💰</span>
              <span>${event.budget}</span>
            </div>
          ) : null}
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-600">Progress</span>
            <span className="text-xs text-gray-500">
              {completedItems}/{totalItems}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Expanded Checklist */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-100">
          <div className="space-y-2 mb-4">
            {event.checklist && event.checklist.length > 0 ? (
              event.checklist.map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded"
                >
                  <input
                    type="checkbox"
                    id={`checkbox-${event.id}-${item.id}`}
                    checked={item.completed}
                    onChange={(e) => {
                      updateChecklistItem(event.id, item.id, e.target.checked);
                    }}
                    className="w-4 h-4 text-blue-600 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer pointer-events-auto"
                  />
                  <label
                    htmlFor={`checkbox-${event.id}-${item.id}`}
                    className={`flex-1 text-sm cursor-pointer pointer-events-auto select-none ${
                      item.completed
                        ? "text-gray-500 line-through"
                        : "text-gray-700"
                    }`}
                  >
                    {item.label}
                  </label>
                  {item.required && (
                    <span className="text-xs font-semibold text-red-600">
                      *Required
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No checklist items</p>
            )}
          </div>

          {/* Externals Comment Input */}
          {externalsItem && externalsItem.completed && (
            <div className="mt-4 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                🌐 Externals Outreach Details
              </label>
              <textarea
                value={event.externalsComment || ""}
                onChange={(e) => updateExternalsComment(event.id, e.target.value)}
                placeholder="Describe what externals support is needed for this event..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                rows={3}
              />
              <p className="text-xs text-gray-600 mt-2">
                ℹ️ This will create a task for the Externals portfolio
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-3 border-t border-gray-100">
            {event.status === "in-progress" && (
              <button
                onClick={handleMarkReady}
                disabled={!isReady}
                className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                  isReady
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />
                  Mark as Ready
                </span>
              </button>
            )}
            {event.status === "ready" && (
              <div className="flex-1 py-2 px-3 rounded bg-green-50 text-green-700 text-sm font-medium text-center flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                Ready
              </div>
            )}
          </div>

          {/* Info Text for Mark as Ready */}
          {event.status === "in-progress" && !isReady && (
            <p className="text-xs text-gray-500 mt-3">
              ℹ️ Complete all required items (marked with *) to mark this event as ready.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
