import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEvent } from "@/contexts/EventContext";
import AuthHeader from "@/components/AuthHeader";
import CalendarComponent from "@/components/Calendar";
import EventBoard from "@/components/EventBoard";
import CreateEventModal from "@/components/CreateEventModal";
import MarketingRequestForm from "@/components/MarketingRequestForm";
import ExternalsRequestForm from "@/components/ExternalsRequestForm";
import FundraisingForm from "@/components/FundraisingForm";
import ReimbursementForm from "@/components/ReimbursementForm";
import { useState } from "react";
import { ArrowLeft, Plus, AlertCircle, DollarSign, Trash2 } from "lucide-react";
import { Portfolio as PortfolioType, useCalendar } from "@/contexts/CalendarContext";

// Portfolio metadata
const portfolioData: Record<
  string,
  {
    name: string;
    description: string;
    color: string;
  }
> = {
  charity: {
    name: "Charity",
    description: "Manage charitable initiatives and funding",
    color: "from-red-50 to-red-100",
  },
  events: {
    name: "Events",
    description: "Plan and coordinate club events",
    color: "from-blue-50 to-blue-100",
  },
  finance: {
    name: "Finance",
    description: "Budget tracking and reimbursements",
    color: "from-green-50 to-green-100",
  },
  marketing: {
    name: "Marketing",
    description: "Campaigns and promotional content",
    color: "from-purple-50 to-purple-100",
  },
  internals: {
    name: "Internals",
    description: "Internal operations and administration",
    color: "from-amber-50 to-amber-100",
  },
  advocacy: {
    name: "Advocacy",
    description: "Policy advocacy and awareness campaigns",
    color: "from-orange-50 to-orange-100",
  },
  externals: {
    name: "Externals",
    description: "Community outreach and partnerships",
    color: "from-cyan-50 to-cyan-100",
  },
};

// Portfolios that have calendars
const CALENDAR_PORTFOLIOS: PortfolioType[] = ["charity", "events", "advocacy", "internals", "marketing"];

type TabType = "projects" | "calendar" | "marketing" | "fundraising" | "minutes" | "cross-portfolio";

export default function Portfolio() {
  const { portfolio } = useParams<{ portfolio: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createSocialEvent, fundraisingEntries, deleteFundraisingEntry, socialEvents, reimbursements, deleteReimbursement } = useEvent();
  const { events: calendarEvents } = useCalendar();
  const [activeTab, setActiveTab] = useState<TabType>("projects");
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [selectedCalendarEventData, setSelectedCalendarEventData] = useState<{
    title?: string;
    description?: string;
    dateTime?: string;
    location?: string;
    budget?: string;
  } | undefined>(undefined);
  const [isMarketingFormOpen, setIsMarketingFormOpen] = useState(false);
  const [isExternalsFormOpen, setIsExternalsFormOpen] = useState(false);
  const [isCreateSocialOpen, setIsCreateSocialOpen] = useState(false);
  const [isFundraisingFormOpen, setIsFundraisingFormOpen] = useState(false);
  const [isReimbursementFormOpen, setIsReimbursementFormOpen] = useState(false);
  const [newSocial, setNewSocial] = useState({ title: "", description: "", dateTime: "", location: "" });
  const [showAddMinutes, setShowAddMinutes] = useState(false);
  const [meetingMinutes, setMeetingMinutes] = useState<Array<{ id: string; date: string; googleDocUrl: string }>>([]);

  // Define permissions early (before any conditional checks)
  const canEdit =
    user?.role === "co-president" ||
    (user?.role === "vp" && user?.portfolio === portfolio);

  const canView =
    user?.role === "co-president" ||
    user?.role === "vp" ||
    (user?.role === "team-member" && user?.portfolio === portfolio) ||
    user?.role === "volunteer";

  if (!portfolio || !portfolioData[portfolio as PortfolioType]) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AuthHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <h1 className="text-2xl font-bold text-gray-900">
              Portfolio Not Found
            </h1>
            <p className="text-gray-600 mt-2">
              You don't have access to this portfolio.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Check if user can view this portfolio
  if (!canView) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AuthHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <h1 className="text-2xl font-bold text-gray-900">
              Access Restricted
            </h1>
            <p className="text-gray-600 mt-2">
              You don't have permission to view this portfolio.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleCalendarEventClick = (eventId: string) => {
    const calendarEvent = calendarEvents.find(e => e.id === eventId);
    if (calendarEvent) {
      setSelectedCalendarEventData({
        title: calendarEvent.title,
        description: calendarEvent.description,
        dateTime: calendarEvent.date,
        location: calendarEvent.description,
        budget: "",
      });
      setIsCreateEventOpen(true);
      setActiveTab("projects");
    }
  };

  const handleCreateSocial = () => {
    if (newSocial.title && newSocial.dateTime && user?.name) {
      createSocialEvent({
        title: newSocial.title,
        description: newSocial.description,
        dateTime: newSocial.dateTime,
        location: newSocial.location,
        createdBy: user.name,
      });
      setNewSocial({ title: "", description: "", dateTime: "", location: "" });
      setIsCreateSocialOpen(false);
    }
  };

  const handleAddMeetingMinute = (googleDocUrl: string) => {
    if (googleDocUrl) {
      const minute = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        googleDocUrl,
      };
      setMeetingMinutes([minute, ...meetingMinutes]);
      setShowAddMinutes(false);
    }
  };

  const handleDeleteMeetingMinute = (id: string) => {
    setMeetingMinutes(meetingMinutes.filter(m => m.id !== id));
  };

  const data = portfolioData[portfolio as PortfolioType];
  const hasCalendar = CALENDAR_PORTFOLIOS.includes(portfolio as PortfolioType);

  // Only Events, Charity, and Advocacy can create events
  const canCreateEvents =
    canEdit &&
    (portfolio === "events" || portfolio === "charity" || portfolio === "advocacy");

  const tabs: Array<{ id: TabType; label: string; show: boolean }> = [
    { id: "projects", label: portfolio === "internals" ? "Social Events" : (canCreateEvents ? "Projects / Events" : "View Requests"), show: portfolio === "internals" || canCreateEvents ? true : true },
    { id: "calendar", label: portfolio === "marketing" ? "Posting Calendar" : "Calendar", show: hasCalendar },
    { id: "cross-portfolio", label: "Cross-Portfolio Requests", show: canView && (portfolio === "events" || portfolio === "charity" || portfolio === "advocacy") },
    { id: "fundraising", label: "Money Raised", show: portfolio === "finance" && canEdit },
    { id: "minutes", label: "Meeting Minutes", show: portfolio === "internals" && canEdit },
  ];

  const visibleTabs = tabs.filter(t => t.show);

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
            {data.name}
          </h1>
          <p className="text-sm text-gray-600">{data.description}</p>
        </div>

        {/* View-Only Notice for VPs viewing other portfolios */}
        {user?.role === "vp" && user?.portfolio !== portfolio && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">👁️ View Mode:</span> You're viewing this portfolio as a snapshot. Only <strong>{portfolioData[user.portfolio as PortfolioType]?.name}</strong> portfolio has full edit access.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {canCreateEvents && (
          <div className="mb-4 flex gap-2 flex-wrap">
            <button
              onClick={() => setIsCreateEventOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Event
            </button>
          </div>
        )}

        {/* Internals - Social Events */}
        {portfolio === "internals" && (
          <div className="mb-4">
            <button
              onClick={() => setIsCreateSocialOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Social Event
            </button>
          </div>
        )}

        {/* Finance - Log Money Raised */}
        {portfolio === "finance" && canEdit && (
          <div className="mb-4">
            <button
              onClick={() => setIsFundraisingFormOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Log Money Raised
            </button>
          </div>
        )}

        {/* View-Only Notice */}
        {canEdit && !canCreateEvents && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">ℹ️ View Mode:</span> Only Events, Charity, and Advocacy portfolios can create events. You can view and manage requests below.
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-4 border-b border-gray-200 overflow-x-auto">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>


        {/* Projects / Events Tab */}
        {activeTab === "projects" && (
          <>
            {portfolio === "internals" ? (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                      Social Events
                    </h3>
                    <span className="text-sm text-gray-600">{socialEvents.length} events</span>
                  </div>

                  {socialEvents.length > 0 ? (
                    <div className="space-y-4">
                      {socialEvents
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((social) => (
                          <div key={social.id} className="bg-white rounded-lg p-4 border border-purple-200">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-gray-900">{social.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  Created by {social.createdBy}
                                </p>
                              </div>
                              <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded">
                                🎉 Social
                              </span>
                            </div>
                            {social.description && (
                              <p className="text-sm text-gray-600 mt-2">{social.description}</p>
                            )}
                            <div className="flex flex-wrap gap-3 text-sm mt-3">
                              {social.dateTime && (
                                <div className="flex items-center gap-1 text-gray-600">
                                  <span className="font-medium">📅</span>
                                  <span>{new Date(social.dateTime).toLocaleDateString()} at {new Date(social.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                              )}
                              {social.location && (
                                <div className="flex items-center gap-1 text-gray-600">
                                  <span className="font-medium">📍</span>
                                  <span>{social.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-600 mb-4">No social events created yet</p>
                      <button
                        onClick={() => setIsCreateSocialOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Create Social Event
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <EventBoard
                portfolio={portfolio as PortfolioType}
                onCreateEvent={() => setIsCreateEventOpen(true)}
                canCreate={canCreateEvents}
                showEventSections={canCreateEvents}
              />
            )}
          </>
        )}

        {/* Calendar Tab */}
        {activeTab === "calendar" && hasCalendar && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Calendar</h3>
            <CalendarComponent
              portfolio={portfolio as PortfolioType}
              onEventClick={handleCalendarEventClick}
            />
          </div>
        )}

        {/* Fundraising Tab - Finance Only */}
        {activeTab === "fundraising" && portfolio === "finance" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Fundraising Log
              </h2>

              {fundraisingEntries.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">No fundraising entries yet</p>
                  <button
                    onClick={() => setIsFundraisingFormOpen(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add First Entry
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {fundraisingEntries
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-start justify-between p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{entry.title}</h3>
                            <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                              {entry.source || "Fundraising"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {new Date(entry.date).toLocaleDateString()}
                            {entry.notes && ` • ${entry.notes}`}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Submitted by: {entry.submittedBy}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 ml-4">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">
                              ${entry.amount.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">CAD</p>
                          </div>
                          <button
                            onClick={() => deleteFundraisingEntry(entry.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">Total Money Raised</p>
                        <p className="text-3xl font-bold text-green-600 mt-1">
                          ${fundraisingEntries.reduce((sum, e) => sum + e.amount, 0).toLocaleString()} CAD
                        </p>
                      </div>
                      <button
                        onClick={() => setIsFundraisingFormOpen(true)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors inline-flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Entry
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Meeting Minutes Tab - Internals Only */}
        {activeTab === "minutes" && portfolio === "internals" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  📋 Meeting Minutes
                </h2>
                <button
                  onClick={() => setShowAddMinutes(!showAddMinutes)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {showAddMinutes && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Google Doc URL
                  </label>
                  <input
                    type="url"
                    id="meeting-doc-url"
                    placeholder="https://docs.google.com/document/d/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3 focus:outline-none focus:border-blue-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const input = e.currentTarget;
                        handleAddMeetingMinute(input.value);
                        input.value = "";
                      }
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const input = document.getElementById("meeting-doc-url") as HTMLInputElement;
                        handleAddMeetingMinute(input.value);
                        input.value = "";
                      }}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setShowAddMinutes(false)}
                      className="flex-1 px-3 py-2 bg-gray-200 text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {meetingMinutes.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-600 mb-4">No meeting minutes submitted yet</p>
                  <button
                    onClick={() => setShowAddMinutes(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add First Entry
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {meetingMinutes.map((minute) => (
                    <div key={minute.id} className="flex justify-between items-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-2">
                          {new Date(minute.date).toLocaleDateString()}
                        </p>
                        <a
                          href={minute.googleDocUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-blue-600 hover:text-blue-700 underline"
                        >
                          View Meeting Minutes
                        </a>
                      </div>
                      <button
                        onClick={() => handleDeleteMeetingMinute(minute.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cross-Portfolio Requests Tab */}
        {activeTab === "cross-portfolio" && (
          <div className="space-y-6">
            {/* Marketing Request Card */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    📣 Request Marketing Support
                  </h2>
                  <p className="text-gray-600 mt-2">
                    Submit a request to the Marketing team for promotional content, social media posts, or campaign support.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMarketingFormOpen(true)}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                New Marketing Request
              </button>
            </div>

            {/* Externals Request Card */}
            {portfolio !== "externals" && (
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      🌐 Request External Outreach
                    </h2>
                    <p className="text-gray-600 mt-2">
                      Submit a request to the Externals team for community partnerships, outreach coordination, or external communications.
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  <strong>Note:</strong> You can also request externals support by checking "Externals request submitted" in the Projects/Events tab when creating or editing an event.
                </p>
                <button
                  onClick={() => setIsExternalsFormOpen(true)}
                  className="px-6 py-3 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 transition-colors inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  New Externals Request
                </button>
              </div>
            )}

            {/* Finance Reimbursement Request Card */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    💰 Submit Finance Reimbursement
                  </h2>
                  <p className="text-gray-600 mt-2">
                    Submit expense receipts for approval. Include receipt image, amount requested, description, and related event details.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsReimbursementFormOpen(true)}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                New Reimbursement Request
              </button>
            </div>

            {/* Submitted Reimbursements View - Only for Finance Portfolio */}
            {portfolio === "finance" && reimbursements.length > 0 && (
              <div className="bg-white rounded-lg p-6 border border-orange-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                    All Reimbursement Submissions
                  </h2>
                  <span className="text-sm text-gray-600">{reimbursements.length} submissions</span>
                </div>

                <div className="space-y-4">
                  {reimbursements
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((reimbursement) => {
                      const relatedEvent = reimbursement.relatedEventId
                        ? events.find((e) => e.id === reimbursement.relatedEventId)
                        : null;
                      return (
                        <div
                          key={reimbursement.id}
                          className={`bg-gray-50 rounded-lg p-4 border ${
                            reimbursement.status === "approved"
                              ? "border-green-200"
                              : reimbursement.status === "rejected"
                                ? "border-red-200"
                                : "border-orange-200"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                ${reimbursement.amount.toFixed(2)}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {reimbursement.description}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              {reimbursement.status === "approved" && (
                                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded whitespace-nowrap">
                                  ✓ Approved
                                </span>
                              )}
                              {reimbursement.status === "rejected" && (
                                <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded whitespace-nowrap">
                                  ✗ Rejected
                                </span>
                              )}
                              {reimbursement.status === "pending" && (
                                <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded whitespace-nowrap">
                                  ⏳ Pending
                                </span>
                              )}
                              <p className="text-xs text-gray-500">
                                {new Date(reimbursement.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {reimbursement.receiptImage && (
                            <div className="mb-3">
                              <img
                                src={reimbursement.receiptImage}
                                alt="Receipt"
                                className="max-h-40 rounded border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => {
                                  const img = new Image();
                                  img.src = reimbursement.receiptImage!;
                                  const w = window.open("");
                                  if (w) {
                                    w.document.write(img.outerHTML);
                                  }
                                }}
                              />
                            </div>
                          )}

                          {relatedEvent && (
                            <p className="text-xs text-gray-600 mb-3">
                              📅 Related to: <span className="font-medium">{relatedEvent.title}</span>
                            </p>
                          )}

                          {reimbursement.approverComment && (
                            <div className="bg-white rounded p-3 border border-gray-200 mb-3">
                              <p className="text-xs font-semibold text-gray-700 mb-1">Finance Note:</p>
                              <p className="text-sm text-gray-700">{reimbursement.approverComment}</p>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Submitted by {reimbursement.submittedBy}</span>
                            {reimbursement.status === "pending" && (
                              <button
                                onClick={() => deleteReimbursement(reimbursement.id)}
                                className="text-red-600 hover:text-red-700 font-semibold"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        <CreateEventModal
          isOpen={isCreateEventOpen}
          onClose={() => {
            setIsCreateEventOpen(false);
            setSelectedCalendarEventData(undefined);
          }}
          portfolio={portfolio as PortfolioType}
          initialData={selectedCalendarEventData}
        />

        <MarketingRequestForm
          isOpen={isMarketingFormOpen}
          onClose={() => setIsMarketingFormOpen(false)}
          portfolio={portfolio as PortfolioType}
        />

        <ExternalsRequestForm
          isOpen={isExternalsFormOpen}
          onClose={() => setIsExternalsFormOpen(false)}
          portfolio={portfolio as PortfolioType}
        />

        <FundraisingForm
          isOpen={isFundraisingFormOpen}
          onClose={() => setIsFundraisingFormOpen(false)}
        />

        <ReimbursementForm
          isOpen={isReimbursementFormOpen}
          onClose={() => setIsReimbursementFormOpen(false)}
        />

        {/* Social Event Modal - Internals Only */}
        {isCreateSocialOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Social Event</h2>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">
                    Event Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Team Dinner"
                    value={newSocial.title}
                    onChange={(e) => setNewSocial({ ...newSocial, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={newSocial.dateTime}
                    onChange={(e) => setNewSocial({ ...newSocial, dateTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Campus Cafeteria"
                    value={newSocial.location}
                    onChange={(e) => setNewSocial({ ...newSocial, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">
                    Description
                  </label>
                  <textarea
                    placeholder="Add details about the social event..."
                    value={newSocial.description}
                    onChange={(e) => setNewSocial({ ...newSocial, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 min-h-24"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleCreateSocial}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Create Social
                </button>
                <button
                  onClick={() => setIsCreateSocialOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
