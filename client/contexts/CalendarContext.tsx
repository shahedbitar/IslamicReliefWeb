import React, { createContext, useContext, useEffect, useState } from "react";

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

const CALENDAR_STORAGE_KEY = "irc_calendar_events";

const CalendarContext = createContext<CalendarContextType | undefined>(
  undefined,
);

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const stored = localStorage.getItem(CALENDAR_STORAGE_KEY);
    if (!stored) return [];

    try {
      const parsed = JSON.parse(stored) as Array<CalendarEvent & { createdAt: string }>;
      return parsed.map((event) => ({
        ...event,
        createdAt: new Date(event.createdAt),
      }));
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(events));
  }, [events]);

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
      prev.map((event) => (event.id === id ? { ...event, ...updates } : event)),
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
        ["marketing", "charity", "events", "internals"].includes(event.portfolio),
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
