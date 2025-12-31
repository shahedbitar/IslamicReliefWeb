import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCalendar, Portfolio } from "@/contexts/CalendarContext";
import { useEvent } from "@/contexts/EventContext";

interface CalendarProps {
  portfolio?: Portfolio;
  isShared?: boolean;
  isDashboard?: boolean; // Show only approved events on dashboard
  onEventClick?: (eventId: string) => void;
}

export default function Calendar({
  portfolio,
  isShared = false,
  isDashboard = false,
  onEventClick,
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 5, 1)); // June 2024
  const { getEventsByPortfolio, getSharedCalendarEvents, getEventsByDate } =
    useCalendar();
  const { getEventsByPortfolio: getTrackedEvents, socialEvents } = useEvent();

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthName = (date: Date) => {
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  };

  const days = [];
  const numDays = daysInMonth(currentDate);
  const firstDay = firstDayOfMonth(currentDate);

  // Empty cells before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Days of the month
  for (let i = 1; i <= numDays; i++) {
    days.push(i);
  }

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const getEventsForDay = (day: number | null) => {
    if (!day) return [];
    const dateStr = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const allEvents = isDashboard
      ? getSharedCalendarEvents() // Use shared calendar events for dashboard
      : isShared
        ? getSharedCalendarEvents()
        : portfolio
          ? getEventsByPortfolio(portfolio)
          : [];

    let eventsForDay = getEventsByDate(dateStr).filter((event) =>
      allEvents.includes(event)
    );

    // Dashboard mode: Only show approved events from creator portfolios + all internals socials
    if (isDashboard) {
      const approvedEvents = eventsForDay.filter((calEvent) => {
        // Only show events from creator portfolios (charity, events, advocacy)
        if (!["charity", "events", "advocacy"].includes(calEvent.portfolio)) {
          return false;
        }
        // Check if this calendar event corresponds to a tracked event
        const trackedEvents = getTrackedEvents(calEvent.portfolio as any);
        const trackedEvent = trackedEvents.find(
          (e) => e.title.toLowerCase() === calEvent.title.toLowerCase()
        );
        // Only show if officially approved by co-presidents (status = "approved")
        return trackedEvent && trackedEvent.status === "approved";
      });

      // Add internals social events (no approval needed)
      const socialEventsForDay = socialEvents
        .filter((social) => {
          const socialDate = social.dateTime.split('T')[0];
          return socialDate === dateStr;
        })
        .map((social) => ({
          id: social.id,
          title: social.title,
          date: dateStr,
          portfolio: "internals" as Portfolio,
          type: "event" as const,
          visible: true,
          createdBy: social.createdBy,
          createdAt: social.createdAt,
          description: social.description,
        }));

      // Combine approved calendar events with social events
      return [...approvedEvents, ...socialEventsForDay];
    }

    // Portfolio-specific view: Show both "ready" (awaiting approval) and "approved" events
    if (!isShared && portfolio && ["charity", "events", "advocacy"].includes(portfolio)) {
      const trackedEvents = getTrackedEvents(portfolio as any);
      return eventsForDay.filter((calEvent) => {
        // Check if this calendar event corresponds to a tracked event
        const trackedEvent = trackedEvents.find(
          (e) => e.title.toLowerCase() === calEvent.title.toLowerCase()
        );
        // Show if awaiting approval (status = "ready") or already approved (status = "approved")
        return !trackedEvent || (trackedEvent.status === "ready" || trackedEvent.status === "approved");
      });
    }

    return eventsForDay;
  };

  const getPortfolioColor = (p: Portfolio) => {
    const colors: Record<Portfolio, string> = {
      charity: "bg-red-100 text-red-700 border-red-300",
      events: "bg-blue-100 text-blue-700 border-blue-300",
      finance: "bg-green-100 text-green-700 border-green-300",
      marketing: "bg-purple-100 text-purple-700 border-purple-300",
      internals: "bg-amber-100 text-amber-700 border-amber-300",
      advocacy: "bg-orange-100 text-orange-700 border-orange-300",
      externals: "bg-cyan-100 text-cyan-700 border-cyan-300",
    };
    return colors[p];
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-900">
          {isDashboard ? "Club Calendar" : isShared ? "Club Calendar" : portfolio === "marketing" ? "Posting Calendar" : `${portfolio.charAt(0).toUpperCase() + portfolio.slice(1)} Calendar`}
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevMonth}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <span className="min-w-32 text-center font-semibold text-xs text-gray-900">
            {monthName(currentDate)}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center font-semibold text-xs text-gray-600 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <div
            key={index}
            className={`h-16 p-1 rounded-lg border text-xs ${
              day
                ? "border-gray-200 bg-white hover:bg-gray-50"
                : "border-transparent bg-gray-50"
            }`}
          >
            {day && (
              <div className="h-full flex flex-col">
                <span className="text-xs font-semibold text-gray-700 mb-0.5">
                  {day}
                </span>
                <div className="flex-1 overflow-y-auto space-y-0.5">
                  {getEventsForDay(day).map((event) => (
                    <button
                      key={event.id}
                      onClick={() => onEventClick?.(event.id)}
                      className={`w-full text-left p-1 rounded text-xs font-medium truncate border cursor-pointer ${getPortfolioColor(
                        event.portfolio
                      )} hover:shadow-md hover:scale-105 transition-all`}
                      title={event.title}
                    >
                      {event.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs font-semibold text-gray-600 mb-3">Legend</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {(isDashboard
            ? (["events", "charity", "advocacy", "internals"] as const)
            : (["events", "charity", "marketing", "internals"] as const)
          ).map((p) => (
            <div key={p} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded ${getPortfolioColor(p)}`} />
              <span className="text-xs text-gray-600 capitalize">{p === "internals" && isDashboard ? "Socials" : p}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
