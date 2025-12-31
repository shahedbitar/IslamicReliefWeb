import React, { createContext, useContext, useState } from "react";
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

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [events, setEvents] = useState<Event[]>([
    {
      id: "e1",
      title: "Lantern Painting Event",
      description: "Community lantern painting and cultural celebration",
      portfolio: "events",
      createdBy: "Fatima Al-Rashid",
      status: "in-progress",
      dateTime: "2024-06-22",
      location: "Main Campus Hall",
      budget: 500,
      marketingRequested: false,
      externalsNeeded: false,
      checklist: [
        { id: "c1", label: "Date & location confirmed", completed: true, required: true },
        { id: "c2", label: "Budget submitted to Finance", completed: true, required: true },
        { id: "c3", label: "Volunteers plan ready", completed: false, required: false },
        { id: "c4", label: "Marketing request submitted", completed: false, required: false },
        { id: "c5", label: "Externals request submitted", completed: false, required: false },
        { id: "c6", label: "Supplies confirmed", completed: false, required: false },
        { id: "c7", label: "Day-of plan ready", completed: false, required: false },
        { id: "c8", label: "Post-event recap submitted", completed: false, required: false },
      ],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },
    {
      id: "e2",
      title: "Halal Food Bank Drive",
      description: "Community food bank initiative",
      portfolio: "charity",
      createdBy: "Amir Hassan",
      status: "approved",
      dateTime: "2024-06-15",
      location: "Downtown Food Bank",
      budget: 0,
      marketingRequested: true,
      externalsNeeded: true,
      externalsComment: "Need to coordinate with local food suppliers and community organizations for donations and logistics support",
      checklist: [
        { id: "c1", label: "Date & location confirmed", completed: true, required: true },
        { id: "c2", label: "Budget submitted to Finance", completed: true, required: true },
        { id: "c3", label: "Volunteers plan ready", completed: true, required: false },
        { id: "c4", label: "Marketing request submitted", completed: true, required: false },
        { id: "c5", label: "Externals request submitted", completed: true, required: false },
        { id: "c6", label: "Supplies confirmed", completed: true, required: false },
      ],
      approvedBy: "Sarah Khan",
      approvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  ]);

  const [socialEvents, setSocialEvents] = useState<SocialEvent[]>([
    {
      id: "s1",
      title: "Team Lunch Gathering",
      description: "Casual team lunch to celebrate Q2 achievements",
      dateTime: "2024-06-20",
      location: "Campus Cafeteria",
      createdBy: "Aisha Patel",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: "s2",
      title: "Board Game Night",
      description: "Fun team bonding activity with board games and snacks",
      dateTime: "2024-06-25",
      location: "Student Lounge",
      createdBy: "Aisha Patel",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  ]);

  const [fundraisingEntries, setFundraisingEntries] = useState<FundraisingEntry[]>([
    {
      id: "f1",
      title: "Fundraising Booths",
      amount: 350,
      source: "Booth",
      submittedBy: "Finance VP",
      date: "2024-06-10",
      notes: "Campus fundraising booths revenue",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  ]);

  const [reimbursements, setReimbursements] = useState<Reimbursement[]>([
    {
      id: "r1",
      amount: 45.50,
      description: "Printing materials for event promotion",
      relatedEventId: "e1",
      submittedBy: "Fatima Al-Rashid",
      status: "pending",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  ]);

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
    setEvents([...events, newEvent]);
    return newEvent;
  };

  const updateEvent = (id: string, updates: Partial<Event>) => {
    setEvents(events.map(e => 
      e.id === id 
        ? { ...e, ...updates, updatedAt: new Date() }
        : e
    ));
  };

  const deleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const getEventsByPortfolio = (portfolio: Portfolio): Event[] => {
    return events.filter(e => e.portfolio === portfolio);
  };

  const updateEventStatus = (id: string, status: EventStatus) => {
    updateEvent(id, { status });
  };

  const updateChecklistItem = (eventId: string, itemId: string, completed: boolean) => {
    setEvents(events.map(e => {
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
    setEvents(events.map(e => {
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
    setSocialEvents([...socialEvents, newSocialEvent]);
    return newSocialEvent;
  };

  const deleteSocialEvent = (id: string) => {
    setSocialEvents(socialEvents.filter(e => e.id !== id));
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
    setFundraisingEntries([...fundraisingEntries, newEntry]);
    return newEntry;
  };

  const updateFundraisingEntry = (id: string, updates: Partial<FundraisingEntry>) => {
    setFundraisingEntries(fundraisingEntries.map(e =>
      e.id === id ? { ...e, ...updates } : e
    ));
  };

  const deleteFundraisingEntry = (id: string) => {
    setFundraisingEntries(fundraisingEntries.filter(e => e.id !== id));
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
    setReimbursements([...reimbursements, newReimbursement]);
    return newReimbursement;
  };

  const updateReimbursement = (id: string, updates: Partial<Reimbursement>) => {
    setReimbursements(reimbursements.map(r =>
      r.id === id ? { ...r, ...updates, updatedAt: new Date() } : r
    ));
  };

  const deleteReimbursement = (id: string) => {
    setReimbursements(reimbursements.filter(r => r.id !== id));
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
