import { useAuth } from "@/contexts/AuthContext";
import { useEvent } from "@/contexts/EventContext";
import AuthHeader from "@/components/AuthHeader";
import EventCard from "@/components/EventCard";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, AlertCircle, Zap, Check } from "lucide-react";

export default function ApprovalsHub() {
  const { user } = useAuth();
  const { events, canMarkReady, updateEventStatus } = useEvent();
  const navigate = useNavigate();

  // Only co-presidents can access this page
  // VPs can also use the approvals hub for viewing/approving events
  if (user?.role !== "co-president" && user?.role !== "vp") {
    return (
      <div className="min-h-screen bg-gray-50">
        <AuthHeader />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
            <p className="text-gray-600 mt-2">
              Only co-presidents and VPs can access the approvals dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Get all pending events (in-progress or ready but not yet approved) from Charity, Events, and Advocacy portfolios
  const pendingEvents = events.filter(
    e => (e.status === "in-progress" || e.status === "ready") && ["charity", "events", "advocacy"].includes(e.portfolio)
  );

  // Get all approved events from Charity, Events, and Advocacy portfolios
  const approvedEvents = events.filter(
    e => e.status === "approved" && ["charity", "events", "advocacy"].includes(e.portfolio)
  );

  const handleApproveEvent = (eventId: string) => {
    updateEventStatus(eventId, "approved");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Event Approvals
          </h1>
          <p className="text-sm text-gray-600">
            Review and {user?.role === "co-president" ? "approve" : "view"} events from Charity, Events, and Advocacy portfolios
            {user?.role === "vp" && (
              <span className="block text-xs text-gray-500 mt-1">
                💡 Access this page from Dashboard → All Portfolios view
              </span>
            )}
          </p>
        </div>

        {/* Pending Events Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
              Events Awaiting Approval
            </h2>
            <span className="text-sm text-gray-600">{pendingEvents.length} items</span>
          </div>

          {pendingEvents.length > 0 ? (
            <div className="space-y-4">
              {pendingEvents.map(event => (
                <div
                  key={event.id}
                  className={`bg-white rounded-lg p-4 border ${
                    event.status === "ready" ? "border-blue-200 bg-blue-50" : "border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="capitalize font-medium">{event.portfolio}</span> • Created by {event.createdBy}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {event.status === "ready" && (
                        <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded whitespace-nowrap">
                          ✓ Ready for Approval
                        </span>
                      )}
                      {event.status === "in-progress" && (
                        <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded whitespace-nowrap">
                          ⏳ In Progress
                        </span>
                      )}
                    </div>
                  </div>

                  {event.description && (
                    <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                  )}

                  {/* Event Details */}
                  <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
                    {event.dateTime && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">📅</span>
                        <span className="text-gray-700">{new Date(event.dateTime).toLocaleDateString()}</span>
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">📍</span>
                        <span className="text-gray-700">{event.location}</span>
                      </div>
                    )}
                    {event.budget && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">💰</span>
                        <span className="text-gray-700">${event.budget}</span>
                      </div>
                    )}
                  </div>

                  {/* Checklist Progress */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Checklist Progress</p>
                    <div className="space-y-2">
                      {event.checklist.map(item => (
                        <div key={item.id} className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={item.completed}
                            disabled
                            className="w-4 h-4 rounded cursor-not-allowed"
                          />
                          <span className={item.completed ? "text-green-600 line-through" : "text-gray-600"}>
                            {item.label}
                            {item.required && <span className="text-red-500 ml-1">*</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${(event.checklist.filter(i => i.completed).length / event.checklist.length) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {event.checklist.filter(i => i.completed).length}/{event.checklist.length} completed
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {user?.role === "co-president" && (
                    <div className="flex gap-2">
                      {event.status === "in-progress" ? (
                        <button
                          disabled
                          className="flex-1 px-4 py-2 bg-gray-300 text-gray-600 rounded-lg font-semibold cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <Zap className="w-4 h-4" />
                          Still In Progress
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApproveEvent(event.id)}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Approve Event
                        </button>
                      )}
                    </div>
                  )}

                  {user?.role === "co-president" && event.status === "in-progress" && (
                    <p className="text-xs text-amber-600 mt-2">
                      ⚠️ Event is still in progress. VP must complete checklist and mark as ready first.
                    </p>
                  )}

                  {user?.role === "vp" && (
                    <p className="text-xs text-gray-600 mt-2 px-4 py-2 bg-gray-100 rounded-lg">
                      📋 Approval is managed by co-presidents only. You can review event details here.
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <p className="text-gray-600 font-semibold">All caught up!</p>
              <p className="text-sm text-gray-500 mt-1">
                No events awaiting approval right now
              </p>
            </div>
          )}
        </div>

        {/* Approved Events Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-3 h-3 bg-green-600 rounded-full"></span>
              Approved Events
            </h2>
            <span className="text-sm text-gray-600">{approvedEvents.length} items</span>
          </div>

          {approvedEvents.length > 0 ? (
            <div className="space-y-4">
              {approvedEvents.map(event => (
                <div
                  key={event.id}
                  className="bg-white rounded-lg p-4 border border-green-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="capitalize font-medium">{event.portfolio}</span> • Created by {event.createdBy}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded whitespace-nowrap">
                      ✓ Approved
                    </span>
                  </div>

                  {event.description && (
                    <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                  )}

                  {/* Event Details */}
                  <div className="grid grid-cols-3 gap-3 mt-3 text-sm">
                    {event.dateTime && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">📅</span>
                        <span className="text-gray-700">{new Date(event.dateTime).toLocaleDateString()}</span>
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">📍</span>
                        <span className="text-gray-700">{event.location}</span>
                      </div>
                    )}
                    {event.budget && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">💰</span>
                        <span className="text-gray-700">${event.budget}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-600">No approved events yet</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
