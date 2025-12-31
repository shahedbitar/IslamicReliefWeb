import { Event, useEvent } from "@/contexts/EventContext";
import { Portfolio } from "@/contexts/CalendarContext";
import EventCard from "./EventCard";
import { Plus } from "lucide-react";

interface EventBoardProps {
  portfolio: Portfolio;
  onCreateEvent?: () => void;
  canCreate?: boolean;
  showEventSections?: boolean;
}

export default function EventBoard({ portfolio, onCreateEvent, canCreate = true, showEventSections = true }: EventBoardProps) {
  const { events: allEvents, getEventsByPortfolio, getMarketingRequests, getBudgetRequests, getExternalsTasks } = useEvent();
  const events = getEventsByPortfolio(portfolio);

  const inProgressEvents = events.filter(e => e.status === "in-progress");
  const readyEvents = events.filter(e => e.status === "ready");
  const awaitingApprovalEvents = [...inProgressEvents, ...readyEvents]; // Both in-progress and ready events are awaiting approval

  // For approved events, get all approved events from charity, events, and advocacy portfolios
  const approvedEventsFromCreators = allEvents.filter(
    e => e.status === "approved" && ["charity", "events", "advocacy"].includes(e.portfolio)
  );

  // Get requests from other portfolios based on current portfolio
  const marketingRequests = getMarketingRequests();
  const budgetRequests = getBudgetRequests();
  const externalsTasks = getExternalsTasks();

  return (
    <div className="space-y-8">
      {/* Marketing Requests Section - only show in Marketing portfolio */}
      {portfolio === "marketing" && marketingRequests.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
              Marketing Requests
            </h3>
            <span className="text-sm text-gray-600">{marketingRequests.length} requests</span>
          </div>
          <div className="space-y-4">
            {marketingRequests.map(request => (
              <div key={request.id} className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">{request.title}</h4>
                    <p className="text-sm text-gray-600">
                      From <span className="font-medium capitalize">{request.portfolio}</span> • {request.createdBy}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded">
                    📣 Marketing Needed
                  </span>
                </div>
                {request.description && (
                  <p className="text-sm text-gray-600 mt-2">{request.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget Requests Section - only show in Finance portfolio */}
      {portfolio === "finance" && budgetRequests.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              Budget Submissions
            </h3>
            <span className="text-sm text-gray-600">{budgetRequests.length} submissions</span>
          </div>
          <div className="space-y-4">
            {budgetRequests.map(request => (
              <div key={request.id} className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">{request.title}</h4>
                    <p className="text-sm text-gray-600">
                      From <span className="font-medium capitalize">{request.portfolio}</span> • {request.createdBy}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                    💰 ${request.budget}
                  </span>
                </div>
                {request.description && (
                  <p className="text-sm text-gray-600 mt-2">{request.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Externals Tasks Section - only show in Externals portfolio */}
      {portfolio === "externals" && externalsTasks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-3 h-3 bg-cyan-500 rounded-full"></span>
              Outreach Requests
            </h3>
            <span className="text-sm text-gray-600">{externalsTasks.length} tasks</span>
          </div>
          <div className="space-y-4">
            {externalsTasks.map(task => (
              <div key={task.id} className="bg-white rounded-lg p-4 border border-cyan-200">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{task.eventTitle}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Requested by <span className="font-medium capitalize">{task.sourcePortfolio}</span> • {task.requestedBy}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-cyan-600 bg-cyan-50 px-2 py-1 rounded whitespace-nowrap">
                    📋 Task
                  </span>
                </div>
                <div className="bg-gray-50 rounded p-3 border border-gray-200">
                  <p className="text-sm text-gray-700">{task.comment}</p>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Created {new Date(task.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* In Progress & Ready Events Section - Only show if showEventSections */}
      {showEventSections && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
              Events Awaiting Approval
            </h3>
            <span className="text-sm text-gray-600">{awaitingApprovalEvents.length} items</span>
          </div>

          {awaitingApprovalEvents.length > 0 ? (
            <div className="space-y-4">
              {awaitingApprovalEvents.map(event => (
                <div key={event.id} className={`relative ${event.status === "ready" ? "ring-1 ring-blue-200" : ""}`}>
                  {event.status === "ready" && (
                    <div className="absolute -top-2 -right-2 text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                      Ready for Approval
                    </div>
                  )}
                  <EventCard key={event.id} event={event} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-600 mb-4">No events awaiting approval</p>
              {canCreate && (
                <button
                  onClick={onCreateEvent}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Event
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Approved Events Section - Only show if showEventSections */}
      {showEventSections && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-3 h-3 bg-green-600 rounded-full"></span>
              Approved Events
            </h3>
            <span className="text-sm text-gray-600">{approvedEventsFromCreators.length} items</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">✓ Officially approved by co-presidents</p>

          {approvedEventsFromCreators.length > 0 ? (
            <div className="space-y-4">
              {approvedEventsFromCreators.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-600">No approved events yet</p>
            </div>
          )}
        </div>
      )}

      {/* Create Event Button - Floating */}
      {inProgressEvents.length > 0 && canCreate && (
        <button
          onClick={onCreateEvent}
          className="w-full py-3 border-2 border-dashed border-blue-300 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Event
        </button>
      )}
    </div>
  );
}
