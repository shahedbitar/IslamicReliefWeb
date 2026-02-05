import React, { createContext, useContext, useEffect, useState } from "react";
import { Portfolio } from "./CalendarContext";

export type EventStatus = "in-progress" | "ready" | "approved";

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  required: boolean; // if true, must be checked before marking "ready"
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  portfolio: Portfolio;
  createdBy: string; // VP who created it
  status: EventStatus; // in-progress -> ready (VP completed) -> approved (co-pres approved)
  dateTime?: string; // ISO date string
  location?: string;
  budget?: number;
  marketingRequested: boolean;
  externalsNeeded: boolean;
  externalsComment?: string; // Comment for externals task
  checklist: ChecklistItem[];
  approvedBy?: string; // Co-president who approved
  approvedAt?: Date; // When approval happened
  createdAt: Date;
  updatedAt: Date;
}

export interface ExternalsTask {
  id: string;
  eventId: string;
  eventTitle: string;
  sourcePortfolio: Portfolio;
  requestedBy: string;
  comment: string;
  status: "pending" | "completed";
  createdAt: Date;
}

export interface SocialEvent {
  id: string;
  title: string;
  description?: string;
  dateTime: string; // ISO date string
  location?: string;
  createdBy: string;
  createdAt: Date;
}

export interface FundraisingEntry {
  id: string;
  title: string; // e.g., "Donation Drive", "Fundraising Booths"
  amount: number;
  source?: string; // e.g., "Event", "Booth", "Online Campaign"
  submittedBy: string;
  date: string; // ISO date string
  notes?: string;
  createdAt: Date;
}

export interface Reimbursement {
  id: string;
  amount: number;
  description: string;
  relatedEventId?: string;
  receiptImage?: string; // Base64 encoded image
  submittedBy: string;
  status: "pending" | "approved" | "rejected";
  approverComment?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface EventContextType {
  events: Event[];
  socialEvents: SocialEvent[];
  fundraisingEntries: FundraisingEntry[];
  reimbursements: Reimbursement[];
  createEvent: (event: Omit<Event, "id" | "createdAt" | "updatedAt" | "checklist">) => Event;
  updateEvent: (id: string, updates: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  getEventsByPortfolio: (portfolio: Portfolio) => Event[];
  updateEventStatus: (id: string, status: EventStatus) => void;
  updateChecklistItem: (eventId: string, itemId: string, completed: boolean) => void;
  addChecklistItem: (eventId: string, item: Omit<ChecklistItem, "id">) => void;
  canMarkReady: (eventId: string) => boolean;
  // Cross-portfolio request getters
  getMarketingRequests: () => Event[];
  getBudgetRequests: () => Event[];
  getExternalsRequests: () => Event[];
  // Externals tasks
  updateExternalsComment: (eventId: string, comment: string) => void;
  getExternalsTasks: () => ExternalsTask[];
  // Social events
  createSocialEvent: (event: Omit<SocialEvent, "id" | "createdAt">) => SocialEvent;
  deleteSocialEvent: (id: string) => void;
  getUpcomingSocials: () => SocialEvent[];
  // Fundraising entries (tracked by Finance)
  createFundraisingEntry: (entry: Omit<FundraisingEntry, "id" | "createdAt">) => FundraisingEntry;
  updateFundraisingEntry: (id: string, updates: Partial<FundraisingEntry>) => void;
  deleteFundraisingEntry: (id: string) => void;
  getTotalMoneyRaised: () => number;
  // Reimbursements (submitted by any portfolio, approved by Finance)
  submitReimbursement: (reimbursement: Omit<Reimbursement, "id" | "createdAt" | "updatedAt">) => Reimbursement;
  updateReimbursement: (id: string, updates: Partial<Reimbursement>) => void;
  deleteReimbursement: (id: string) => void;
  getReimbursements: () => Reimbursement[];
  getPendingReimbursements: () => Reimbursement[];
  approveReimbursement: (id: string, approverComment?: string) => void;
  rejectReimbursement: (id: string, approverComment: string) => void;
}


const EVENT_STORAGE_KEY = "irc_event_context";

interface EventStoragePayload {
  events: Event[];
  socialEvents: SocialEvent[];
  fundraisingEntries: FundraisingEntry[];
  reimbursements: Reimbursement[];
}

function hydrateEventStorage(raw: EventStoragePayload): EventStoragePayload {
  return {
    events: raw.events.map((event) => ({
      ...event,
      createdAt: new Date(event.createdAt),
      updatedAt: new Date(event.updatedAt),
      approvedAt: event.approvedAt ? new Date(event.approvedAt) : undefined,
    })),
    socialEvents: raw.socialEvents.map((event) => ({
      ...event,
      createdAt: new Date(event.createdAt),
    })),
    fundraisingEntries: raw.fundraisingEntries.map((entry) => ({
      ...entry,
      createdAt: new Date(entry.createdAt),
    })),
    reimbursements: raw.reimbursements.map((reimbursement) => ({
      ...reimbursement,
      createdAt: new Date(reimbursement.createdAt),
      updatedAt: new Date(reimbursement.updatedAt),
    })),
  };
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [events, setEvents] = useState<Event[]>(() => {
    const stored = localStorage.getItem(EVENT_STORAGE_KEY);
    if (!stored) return [];
    try {
      const payload = hydrateEventStorage(JSON.parse(stored) as EventStoragePayload);
      return payload.events;
    } catch {
      return [];
    }
  });

  const [socialEvents, setSocialEvents] = useState<SocialEvent[]>(() => {
    const stored = localStorage.getItem(EVENT_STORAGE_KEY);
    if (!stored) return [];
    try {
      const payload = hydrateEventStorage(JSON.parse(stored) as EventStoragePayload);
      return payload.socialEvents;
    } catch {
      return [];
    }
  });

  const [fundraisingEntries, setFundraisingEntries] = useState<FundraisingEntry[]>(() => {
    const stored = localStorage.getItem(EVENT_STORAGE_KEY);
    if (!stored) return [];
    try {
      const payload = hydrateEventStorage(JSON.parse(stored) as EventStoragePayload);
      return payload.fundraisingEntries;
    } catch {
      return [];
    }
  });

  const [reimbursements, setReimbursements] = useState<Reimbursement[]>(() => {
    const stored = localStorage.getItem(EVENT_STORAGE_KEY);
    if (!stored) return [];
    try {
      const payload = hydrateEventStorage(JSON.parse(stored) as EventStoragePayload);
      return payload.reimbursements;
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(
      EVENT_STORAGE_KEY,
      JSON.stringify({ events, socialEvents, fundraisingEntries, reimbursements }),
    );
  }, [events, socialEvents, fundraisingEntries, reimbursements]);

  const createEvent = (event: Omit<Event, "id" | "createdAt" | "updatedAt" | "checklist">): Event => {
    // Default checklist items (all portfolios get these)
    const defaultChecklist: ChecklistItem[] = [
      { id: "1", label: "Date & location confirmed", completed: false, required: true },
      { id: "2", label: "Budget submitted to Finance", completed: false, required: true },
      { id: "3", label: "Marketing request submitted", completed: false, required: true },
      { id: "4", label: "Externals reaching out needed?", completed: false, required: false },
      { id: "5", label: "Volunteers plan ready", completed: false, required: false },
      { id: "6", label: "Supplies confirmed", completed: false, required: false },
      { id: "7", label: "Day-of plan ready", completed: false, required: false },
      { id: "8", label: "Post-event recap submitted", completed: false, required: false },
    ];

    const newEvent: Event = {
      ...event,
      id: Date.now().toString(),
      checklist: defaultChecklist,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setEvents((prev) => [...prev, newEvent]);
    return newEvent;
  };

  const updateEvent = (id: string, updates: Partial<Event>) => {
    setEvents((prev) => prev.map(e => 
      e.id === id 
        ? { ...e, ...updates, updatedAt: new Date() }
        : e
    ));
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter(e => e.id !== id));
  };

  const getEventsByPortfolio = (portfolio: Portfolio): Event[] => {
    return events.filter(e => e.portfolio === portfolio);
  };

  const updateEventStatus = (id: string, status: EventStatus) => {
    updateEvent(id, { status });
  };

  const updateChecklistItem = (eventId: string, itemId: string, completed: boolean) => {
    setEvents((prev) => prev.map(e => {
      if (e.id === eventId) {
        return {
          ...e,
          checklist: e.checklist.map(item =>
            item.id === itemId ? { ...item, completed } : item
          ),
          updatedAt: new Date(),
        };
      }
      return e;
    }));
  };

  const addChecklistItem = (eventId: string, item: Omit<ChecklistItem, "id">) => {
    setEvents((prev) => prev.map(e => {
      if (e.id === eventId) {
        return {
          ...e,
          checklist: [...e.checklist, { ...item, id: Date.now().toString() }],
          updatedAt: new Date(),
        };
      }
      return e;
    }));
  };

  const canMarkReady = (eventId: string): boolean => {
    const event = events.find(e => e.id === eventId);
    if (!event) return false;

    // All required checklist items must be completed
    return event.checklist
      .filter(item => item.required)
      .every(item => item.completed);
  };

  const getMarketingRequests = (): Event[] => {
    return events.filter(e => e.marketingRequested);
  };

  const getBudgetRequests = (): Event[] => {
    return events.filter(e =>
      (e.portfolio === "events" || e.portfolio === "charity") &&
      e.budget &&
      e.budget > 0
    );
  };

  const getExternalsRequests = (): Event[] => {
    return events.filter(e => e.externalsNeeded);
  };

  const updateExternalsComment = (eventId: string, comment: string) => {
    updateEvent(eventId, { externalsComment: comment });
  };

  const getExternalsTasks = (): ExternalsTask[] => {
    return events
      .filter(e => e.externalsNeeded && e.externalsComment)
      .map(e => ({
        id: `ext-${e.id}`,
        eventId: e.id,
        eventTitle: e.title,
        sourcePortfolio: e.portfolio,
        requestedBy: e.createdBy,
        comment: e.externalsComment!,
        status: "pending" as const,
        createdAt: e.updatedAt,
      }));
  };

  const createSocialEvent = (event: Omit<SocialEvent, "id" | "createdAt">): SocialEvent => {
    const newSocialEvent: SocialEvent = {
      ...event,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setSocialEvents((prev) => [...prev, newSocialEvent]);
    return newSocialEvent;
  };

  const deleteSocialEvent = (id: string) => {
    setSocialEvents((prev) => prev.filter(e => e.id !== id));
  };

  const getUpcomingSocials = (): SocialEvent[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return socialEvents
      .filter(e => new Date(e.dateTime) >= today)
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  };

  const createFundraisingEntry = (entry: Omit<FundraisingEntry, "id" | "createdAt">): FundraisingEntry => {
    const newEntry: FundraisingEntry = {
      ...entry,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setFundraisingEntries((prev) => [...prev, newEntry]);
    return newEntry;
  };

  const updateFundraisingEntry = (id: string, updates: Partial<FundraisingEntry>) => {
    setFundraisingEntries((prev) => prev.map(e =>
      e.id === id ? { ...e, ...updates } : e
    ));
  };

  const deleteFundraisingEntry = (id: string) => {
    setFundraisingEntries((prev) => prev.filter(e => e.id !== id));
  };

  const getTotalMoneyRaised = (): number => {
    return fundraisingEntries.reduce((sum, entry) => sum + entry.amount, 0);
  };

  const submitReimbursement = (reimbursement: Omit<Reimbursement, "id" | "createdAt" | "updatedAt">): Reimbursement => {
    const newReimbursement: Reimbursement = {
      ...reimbursement,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setReimbursements((prev) => [...prev, newReimbursement]);
    return newReimbursement;
  };

  const updateReimbursement = (id: string, updates: Partial<Reimbursement>) => {
    setReimbursements((prev) => prev.map(r =>
      r.id === id ? { ...r, ...updates, updatedAt: new Date() } : r
    ));
  };

  const deleteReimbursement = (id: string) => {
    setReimbursements((prev) => prev.filter(r => r.id !== id));
  };

  const getReimbursements = (): Reimbursement[] => {
    return reimbursements;
  };

  const getPendingReimbursements = (): Reimbursement[] => {
    return reimbursements.filter(r => r.status === "pending");
  };

  const approveReimbursement = (id: string, approverComment?: string) => {
    updateReimbursement(id, {
      status: "approved",
      approverComment,
    });
  };

  const rejectReimbursement = (id: string, approverComment: string) => {
    updateReimbursement(id, {
      status: "rejected",
      approverComment,
    });
  };

  return (
    <EventContext.Provider
      value={{
        events,
        socialEvents,
        fundraisingEntries,
        reimbursements,
        createEvent,
        updateEvent,
        deleteEvent,
        getEventsByPortfolio,
        updateEventStatus,
        updateChecklistItem,
        addChecklistItem,
        canMarkReady,
        getMarketingRequests,
        getBudgetRequests,
        getExternalsRequests,
        updateExternalsComment,
        getExternalsTasks,
        createSocialEvent,
        deleteSocialEvent,
        getUpcomingSocials,
        createFundraisingEntry,
        updateFundraisingEntry,
        deleteFundraisingEntry,
        getTotalMoneyRaised,
        submitReimbursement,
        updateReimbursement,
        deleteReimbursement,
        getReimbursements,
        getPendingReimbursements,
        approveReimbursement,
        rejectReimbursement,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEvent must be used within an EventProvider");
  }
  return context;
};
