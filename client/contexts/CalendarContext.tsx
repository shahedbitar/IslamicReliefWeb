import React, { createContext, useContext, useState } from "react";

export type Portfolio =
  | "charity"
  | "events"
  | "finance"
  | "marketing"
  | "internals"
  | "advocacy"
  | "externals";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO date string (YYYY-MM-DD)
  startTime?: string; // HH:mm format
  endTime?: string; // HH:mm format
  portfolio: Portfolio;
  type: "event" | "deadline" | "meeting" | "drive" | "booth" | "post" | "milestone";
  color?: string;
  visible: boolean; // controls if shown in shared calendar
  createdBy: string;
  createdAt: Date;
}

interface CalendarContextType {
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, "id" | "createdAt">) => void;
  updateEvent: (id: string, event: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  getEventsByPortfolio: (portfolio: Portfolio) => CalendarEvent[];
  getSharedCalendarEvents: () => CalendarEvent[];
  getEventsByDate: (date: string) => CalendarEvent[];
}

const CalendarContext = createContext<CalendarContextType | undefined>(
  undefined
);

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [events, setEvents] = useState<CalendarEvent[]>([
    // Marketing events
    {
      id: "m1",
      title: "Content Deadline - Fall Campaign",
      date: "2024-06-10",
      portfolio: "marketing",
      type: "deadline",
      color: "purple",
      visible: true,
      createdBy: "Hassan Ibrahim",
      createdAt: new Date(),
    },
    {
      id: "m2",
      title: "Social Media Post Schedule",
      date: "2024-06-12",
      startTime: "10:00",
      endTime: "11:00",
      portfolio: "marketing",
      type: "post",
      color: "purple",
      visible: true,
      createdBy: "Hassan Ibrahim",
      createdAt: new Date(),
    },
    // Charity events
    {
      id: "c1",
      title: "Halal Food Bank Drive",
      date: "2024-06-15",
      startTime: "14:00",
      endTime: "17:00",
      portfolio: "charity",
      type: "drive",
      color: "red",
      visible: true,
      createdBy: "Fatima Malik",
      createdAt: new Date(),
      description: "On-campus charity initiative",
    },
    {
      id: "c2",
      title: "Donation Drive Planning",
      date: "2024-06-08",
      portfolio: "charity",
      type: "meeting",
      color: "red",
      visible: true,
      createdBy: "Fatima Malik",
      createdAt: new Date(),
    },
    // Events portfolio
    {
      id: "e1",
      title: "Clubs Week Booth",
      date: "2024-06-20",
      startTime: "12:00",
      endTime: "16:00",
      portfolio: "events",
      type: "booth",
      color: "blue",
      visible: true,
      createdBy: "Sarah Ahmed",
      createdAt: new Date(),
      description: "IRC booth at clubs week",
    },
    {
      id: "e2",
      title: "Lantern Painting Event",
      date: "2024-06-22",
      startTime: "18:00",
      endTime: "20:00",
      portfolio: "events",
      type: "event",
      color: "blue",
      visible: true,
      createdBy: "Sarah Ahmed",
      createdAt: new Date(),
      description: "Community event planning",
    },
    {
      id: "e3",
      title: "Event Planning Meeting",
      date: "2024-06-05",
      startTime: "15:00",
      endTime: "16:00",
      portfolio: "events",
      type: "meeting",
      color: "blue",
      visible: true,
      createdBy: "Sarah Ahmed",
      createdAt: new Date(),
    },
    // Internals events
    {
      id: "i1",
      title: "Executive Team Meeting",
      date: "2024-06-18",
      startTime: "16:00",
      endTime: "17:00",
      portfolio: "internals",
      type: "meeting",
      color: "amber",
      visible: true,
      createdBy: "Zainab Ali",
      createdAt: new Date(),
    },
    {
      id: "i2",
      title: "Leadership Social",
      date: "2024-06-25",
      startTime: "19:00",
      endTime: "21:00",
      portfolio: "internals",
      type: "event",
      color: "amber",
      visible: true,
      createdBy: "Zainab Ali",
      createdAt: new Date(),
    },
  ]);

  const addEvent = (event: Omit<CalendarEvent, "id" | "createdAt">) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setEvents((prev) => [...prev, newEvent]);
  };

  const updateEvent = (id: string, updates: Partial<CalendarEvent>) => {
    setEvents((prev) =>
      prev.map((event) => (event.id === id ? { ...event, ...updates } : event))
    );
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== id));
  };

  const getEventsByPortfolio = (portfolio: Portfolio): CalendarEvent[] => {
    return events.filter((event) => event.portfolio === portfolio);
  };

  const getSharedCalendarEvents = (): CalendarEvent[] => {
    return events.filter(
      (event) =>
        event.visible &&
        ["marketing", "charity", "events", "internals"].includes(event.portfolio)
    );
  };

  const getEventsByDate = (date: string): CalendarEvent[] => {
    return events.filter((event) => event.date === date);
  };

  return (
    <CalendarContext.Provider
      value={{
        events,
        addEvent,
        updateEvent,
        deleteEvent,
        getEventsByPortfolio,
        getSharedCalendarEvents,
        getEventsByDate,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error("useCalendar must be used within CalendarProvider");
  }
  return context;
};
