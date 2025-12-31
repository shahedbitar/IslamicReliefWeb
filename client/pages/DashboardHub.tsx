import { useAuth } from "@/contexts/AuthContext";
import { useEvent } from "@/contexts/EventContext";
import { useCalendar } from "@/contexts/CalendarContext";
import CalendarComponent from "@/components/Calendar";
import AuthHeader from "@/components/AuthHeader";
import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Plus,
  Trash2,
  X,
} from "lucide-react";

interface PortfolioCard {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  accessible: boolean;
}

interface MeetingMinute {
  id: string;
  date: string;
  googleDocUrl: string;
}

export default function DashboardHub() {
  const { user } = useAuth();
  const { events, getUpcomingSocials, fundraisingEntries, getTotalMoneyRaised, socialEvents } = useEvent();
  const { events: calendarEvents } = useCalendar();
  const [activeTab, setActiveTab] = useState<"money" | "minutes" | "socials">("money");
  const [portfolioView, setPortfolioView] = useState<"my" | "all">("my"); // For VPs: my portfolio or all portfolios
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [meetingMinutes, setMeetingMinutes] = useState<MeetingMinute[]>([
    {
      id: "m1",
      date: "2024-06-15",
      googleDocUrl: "https://docs.google.com/document/d/1example/edit",
    },
    {
      id: "m2",
      date: "2024-06-08",
      googleDocUrl: "https://docs.google.com/document/d/2example/edit",
    },
  ]);
  const [showAddMinutes, setShowAddMinutes] = useState(false);
  const [newMinute, setNewMinute] = useState({ googleDocUrl: "" });

  // Get selected event details (check both calendar events and social events)
  const selectedEvent = selectedEventId
    ? (() => {
        const calEvent = calendarEvents.find(e => e.id === selectedEventId);
        if (calEvent) return calEvent;

        const socialEvent = socialEvents.find(s => s.id === selectedEventId);
        if (socialEvent) {
          return {
            id: socialEvent.id,
            title: socialEvent.title,
            date: socialEvent.dateTime.split('T')[0],
            portfolio: "internals" as const,
            type: "event" as const,
            visible: true,
            createdBy: socialEvent.createdBy,
            createdAt: socialEvent.createdAt,
            description: socialEvent.description,
            startTime: undefined,
            endTime: undefined,
          };
        }
        return null;
      })()
    : null;

  const handleCalendarEventClick = (eventId: string) => {
    setSelectedEventId(eventId);
  };

  const allPortfolios: PortfolioCard[] = [
    {
      id: "charity",
      name: "Charity",
      description: "Manage charitable initiatives and funding",
      icon: <span className="text-2xl">🐵</span>,
      color: "from-red-50 to-red-100",
      accessible:
        user?.role === "co-president" ||
        (user?.role === "vp" && user?.portfolio === "charity") ||
        (user?.role === "team-member" && user?.portfolio === "charity"),
    },
    {
      id: "events",
      name: "Events",
      description: "Plan and coordinate club events",
      icon: <Calendar className="w-6 h-6" />,
      color: "from-blue-50 to-blue-100",
      accessible:
        user?.role === "co-president" ||
        (user?.role === "vp" && user?.portfolio === "events") ||
        (user?.role === "team-member" && user?.portfolio === "events"),
    },
    {
      id: "finance",
      name: "Finance",
      description: "Budget tracking and reimbursements",
      icon: <TrendingUp className="w-6 h-6" />,
      color: "from-green-50 to-green-100",
      accessible:
        user?.role === "co-president" ||
        (user?.role === "vp" && user?.portfolio === "finance") ||
        (user?.role === "team-member" && user?.portfolio === "finance"),
    },
    {
      id: "marketing",
      name: "Marketing",
      description: "Campaigns and promotional content",
      icon: <span className="text-2xl">📣</span>,
      color: "from-purple-50 to-purple-100",
      accessible:
        user?.role === "co-president" ||
        (user?.role === "vp" && user?.portfolio === "marketing") ||
        (user?.role === "team-member" && user?.portfolio === "marketing"),
    },
    {
      id: "internals",
      name: "Internals",
      description: "Internal operations and administration",
      icon: <span className="text-2xl">⚙️</span>,
      color: "from-amber-50 to-amber-100",
      accessible:
        user?.role === "co-president" ||
        (user?.role === "vp" && user?.portfolio === "internals") ||
        (user?.role === "team-member" && user?.portfolio === "internals"),
    },
    {
      id: "advocacy",
      name: "Advocacy",
      description: "Policy advocacy and awareness campaigns",
      icon: <span className="text-2xl">📢</span>,
      color: "from-orange-50 to-orange-100",
      accessible:
        user?.role === "co-president" ||
        (user?.role === "vp" && user?.portfolio === "advocacy") ||
        (user?.role === "team-member" && user?.portfolio === "advocacy"),
    },
    {
      id: "externals",
      name: "Externals",
      description: "Community outreach and partnerships",
      icon: <span className="text-2xl">🌐</span>,
      color: "from-cyan-50 to-cyan-100",
      accessible:
        user?.role === "co-president" ||
        (user?.role === "vp" && user?.portfolio === "externals") ||
        (user?.role === "team-member" && user?.portfolio === "externals"),
    },
  ];

  const getRoleLabel = (role: string, portfolio?: string) => {
    if (role === "co-president") return "Co-President";
    if (role === "vp" && portfolio)
      return `VP - ${portfolio.charAt(0).toUpperCase() + portfolio.slice(1)}`;
    if (role === "team-member") return "Team Member";
    if (role === "volunteer") return "Volunteer";
    return role;
  };

  const accessiblePortfolios = allPortfolios.filter((p) => p.accessible);
  const showOnlyAccessible = user?.role === "volunteer";


  const handleAddMinute = () => {
    if (newMinute.googleDocUrl) {
      const minute: MeetingMinute = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        googleDocUrl: newMinute.googleDocUrl,
      };
      setMeetingMinutes([minute, ...meetingMinutes]);
      setNewMinute({ googleDocUrl: "" });
      setShowAddMinutes(false);
    }
  };

  const handleDeleteMinute = (id: string) => {
    setMeetingMinutes(meetingMinutes.filter(m => m.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              {getRoleLabel(user?.role || "", user?.portfolio)}
            </p>
            {user?.role === "vp" && (
              <p className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                👁️ Currently viewing: <span className="font-semibold">{portfolioView === "my" ? "My Portfolio" : "All Portfolios"}</span>
              </p>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        {(user?.role === "co-president" || (user?.role === "vp" && portfolioView === "all")) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            <Link
              to="/approvals"
              className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xs font-semibold text-gray-600 group-hover:text-blue-600 transition-colors">
                  Events Awaiting Approval
                </h3>
                <Calendar className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {events.filter(e => e.status === "in-progress" && ["charity", "events", "advocacy"].includes(e.portfolio)).length}
              </p>
              <p className="text-xs text-gray-500 mt-1">Pending approval</p>
            </Link>

            <Link
              to="/approvals"
              className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-lg hover:border-green-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xs font-semibold text-gray-600 group-hover:text-green-600 transition-colors">
                  Approved Events
                </h3>
                <CheckCircle className="w-4 h-4 text-green-600 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {events.filter(e => e.status === "approved" && ["charity", "events", "advocacy"].includes(e.portfolio)).length}
              </p>
              <p className="text-xs text-gray-500 mt-1">Approved by co-presidents</p>
            </Link>
          </div>
        )}

        {/* Volunteer Info */}
        {user?.role === "volunteer" && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <p className="text-blue-900">
              <span className="font-semibold">Welcome, Volunteer!</span> Use the
              portfolios below to find volunteer opportunities and manage your
              event shifts.
            </p>
          </div>
        )}

        {/* Main Dashboard Section - Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Left Sidebar - Money Raised & Meeting Minutes */}
          <div className="lg:col-span-1 space-y-6">
            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-gray-200">
              <button
                onClick={() => setActiveTab("money")}
                className={`px-4 py-2 font-semibold text-sm transition-colors ${
                  activeTab === "money"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Money Raised
                </div>
              </button>
              <button
                onClick={() => setActiveTab("minutes")}
                className={`px-4 py-2 font-semibold text-sm transition-colors ${
                  activeTab === "minutes"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Meeting Minutes
                </div>
              </button>
              <button
                onClick={() => setActiveTab("socials")}
                className={`px-4 py-2 font-semibold text-sm transition-colors ${
                  activeTab === "socials"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎉</span>
                  Upcoming Socials
                </div>
              </button>
            </div>

            {/* Money Raised Tab */}
            {activeTab === "money" && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">
                    Total Money Raised
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-green-600">
                      ${getTotalMoneyRaised().toLocaleString()}
                    </span>
                    <span className="text-gray-500">CAD</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Actual funds raised from {fundraisingEntries.length} {fundraisingEntries.length === 1 ? 'source' : 'sources'}
                  </p>
                </div>

                {/* Fundraising Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700">Fundraising Sources</h4>
                  {fundraisingEntries
                    .sort((a, b) => b.amount - a.amount)
                    .map(entry => (
                      <div key={entry.id} className="flex justify-between items-start pb-3 border-b border-gray-100">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{entry.title}</p>
                          <p className="text-xs text-gray-500">{entry.source || 'Fundraising'} • {new Date(entry.date).toLocaleDateString()}</p>
                          {entry.notes && <p className="text-xs text-gray-600 mt-1">{entry.notes}</p>}
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          ${entry.amount.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  {fundraisingEntries.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No fundraising entries submitted yet
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Meeting Minutes Tab */}
            {activeTab === "minutes" && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Meeting Minutes</h3>
                  <button
                    onClick={() => setShowAddMinutes(!showAddMinutes)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {showAddMinutes && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <input
                      type="url"
                      placeholder="Google Doc URL (e.g., https://docs.google.com/document/d/...)"
                      value={newMinute.googleDocUrl}
                      onChange={e => setNewMinute({ ...newMinute, googleDocUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3 focus:outline-none focus:border-blue-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddMinute}
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

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {meetingMinutes.map(minute => (
                    <div key={minute.id} className="pb-4 border-b border-gray-100 last:border-0">
                      <div className="flex justify-between items-center gap-2">
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 mb-2">
                            {new Date(minute.date).toLocaleDateString()}
                          </p>
                          <a
                            href={minute.googleDocUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-semibold text-blue-600 hover:text-blue-700 underline flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4" />
                            View Meeting Minutes
                          </a>
                        </div>
                        <button
                          onClick={() => handleDeleteMinute(minute.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {meetingMinutes.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-8">
                      No meeting minutes yet
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Upcoming Socials Tab */}
            {activeTab === "socials" && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Upcoming Team Socials</h3>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {getUpcomingSocials().map(social => (
                    <div key={social.id} className="pb-3 border-b border-gray-100 last:border-0">
                      <h4 className="text-sm font-semibold text-gray-900">{social.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        📅 {new Date(social.dateTime).toLocaleDateString()} at {new Date(social.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {social.location && (
                        <p className="text-xs text-gray-600 mt-1">
                          📍 {social.location}
                        </p>
                      )}
                      {social.description && (
                        <p className="text-sm text-gray-700 mt-2">{social.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Posted by {social.createdBy}
                      </p>
                    </div>
                  ))}
                  {getUpcomingSocials().length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-8">
                      No upcoming socials scheduled
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Calendar */}
          <div className="lg:col-span-2">
            <div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-blue-900">
                  <span className="font-semibold">📅 Club Calendar:</span> Shows approved events from Events, Charity, and Advocacy portfolios. Internals social events appear automatically without approval.
                </p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <CalendarComponent isDashboard={true} onEventClick={handleCalendarEventClick} />
              </div>
            </div>
          </div>
        </div>

        {/* VP Portfolio View Toggle */}
        {user?.role === "vp" && (
          <div className="mb-6">
            <div className="flex gap-4 items-center border-b border-gray-200 pb-4">
              <h2 className="text-2xl font-bold text-gray-900">Portfolios</h2>
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={() => setPortfolioView("my")}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    portfolioView === "my"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  My Portfolio
                </button>
                <button
                  onClick={() => setPortfolioView("all")}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    portfolioView === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  All Portfolios
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Grid */}
        <div>
          {user?.role !== "vp" && (
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Portfolios</h2>
          )}

          {showOnlyAccessible ? (
            // Show all portfolios for volunteers, but they can only access limited info
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allPortfolios.map((portfolio) => (
                <div
                  key={portfolio.id}
                  className={`bg-gradient-to-br ${portfolio.color} rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-blue-600">{portfolio.icon}</div>
                    <span className="text-xs font-semibold text-gray-500">
                      Volunteer Portal
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {portfolio.name}
                  </h3>
                  <p className="text-sm text-gray-700 mb-4">
                    {portfolio.description}
                  </p>
                  <Link
                    to={`/portfolio/${portfolio.id}`}
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                  >
                    View Opportunities
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* For VPs: Filter based on view mode */}
              {user?.role === "vp" && portfolioView === "my"
                ? // Show only their assigned portfolio
                  accessiblePortfolios.length > 0 ? (
                    accessiblePortfolios.map((portfolio) => (
                      <Link
                        key={portfolio.id}
                        to={`/portfolio/${portfolio.id}`}
                        className={`bg-gradient-to-br ${portfolio.color} rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer group`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="text-blue-600 group-hover:scale-110 transition-transform">
                            {portfolio.icon}
                          </div>
                          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            My Portfolio
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {portfolio.name}
                        </h3>
                        <p className="text-sm text-gray-700">
                          {portfolio.description}
                        </p>
                      </Link>
                    ))
                  ) : (
                    <div className="col-span-full bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                      <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                      <p className="text-yellow-900 font-semibold">
                        No portfolio assigned
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Contact an administrator to assign you to a portfolio.
                      </p>
                    </div>
                  )
                : // Show all portfolios (for VP "All Portfolios" view or co-president)
                  (user?.role === "vp" ? allPortfolios : accessiblePortfolios).length > 0 ? (
                    (user?.role === "vp" ? allPortfolios : accessiblePortfolios).map((portfolio) => (
                      <Link
                        key={portfolio.id}
                        to={`/portfolio/${portfolio.id}`}
                        className={`bg-gradient-to-br ${portfolio.color} rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer group`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="text-blue-600 group-hover:scale-110 transition-transform">
                            {portfolio.icon}
                          </div>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {portfolio.name}
                        </h3>
                        <p className="text-sm text-gray-700">
                          {portfolio.description}
                        </p>
                      </Link>
                    ))
                  ) : (
                    <div className="col-span-full bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                      <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                      <p className="text-yellow-900 font-semibold">
                        No portfolio access
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Contact an administrator to assign you to a portfolio.
                      </p>
                    </div>
                  )}
            </div>
          )}
        </div>

        {/* Event Detail Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
                <h2 className="text-2xl font-bold text-gray-900">{selectedEvent.title}</h2>
                <button
                  onClick={() => setSelectedEventId(null)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Portfolio Badge */}
                <div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 capitalize">
                    {selectedEvent.portfolio}
                  </span>
                </div>

                {/* Description */}
                {selectedEvent.description && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                    <p className="text-gray-700">{selectedEvent.description}</p>
                  </div>
                )}

                {/* Date & Details */}
                <div className="grid grid-cols-2 gap-4">
                  {selectedEvent.date && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-1">📅 Date</h3>
                      <p className="text-gray-700">{new Date(selectedEvent.date).toLocaleDateString()}</p>
                    </div>
                  )}

                  {/* Check for social event with dateTime field */}
                  {selectedEvent.portfolio === "internals" && socialEvents.find(s => s.id === selectedEvent.id)?.dateTime && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-1">⏰ Time</h3>
                      <p className="text-gray-700">
                        {new Date(socialEvents.find(s => s.id === selectedEvent.id)!.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  )}

                  {/* Check for regular calendar event with startTime */}
                  {selectedEvent.startTime && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-1">⏰ Time</h3>
                      <p className="text-gray-700">
                        {selectedEvent.startTime}
                        {selectedEvent.endTime && ` - ${selectedEvent.endTime}`}
                      </p>
                    </div>
                  )}
                </div>

                {/* Location (for socials) */}
                {selectedEvent.portfolio === "internals" && socialEvents.find(s => s.id === selectedEvent.id)?.location && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">📍 Location</h3>
                    <p className="text-gray-700">{socialEvents.find(s => s.id === selectedEvent.id)!.location}</p>
                  </div>
                )}

                {/* Event Type */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Type</h3>
                  <p className="text-gray-700 capitalize">{selectedEvent.type}</p>
                </div>

                {/* Visibility Status */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Status</h3>
                  <div className="flex items-center gap-2">
                    {selectedEvent.visible ? (
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-50 text-green-700">
                        ✓ Visible
                      </span>
                    ) : (
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-50 text-gray-700">
                        Hidden
                      </span>
                    )}
                  </div>
                </div>

                {/* Created By */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Created by <span className="font-semibold">{selectedEvent.createdBy}</span>
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setSelectedEventId(null)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
