import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AuthHeader from "@/components/AuthHeader";
import { useState } from "react";
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, Eye } from "lucide-react";

interface Approval {
  id: string;
  title: string;
  type: string;
  submittedBy: string;
  portfolio: string;
  status: "pending" | "approved" | "rejected";
  submittedDate: string;
  amount?: number;
  description: string;
}

export default function Approvals() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);

  const approvals: Approval[] = [
    {
      id: "a1",
      title: "Summer Fundraiser Event Proposal",
      type: "Event Proposal",
      submittedBy: "Sarah Ahmed (VP - Events)",
      portfolio: "Events",
      status: "pending",
      submittedDate: "2024-05-25",
      description:
        "Large-scale charity fundraiser event planned for June 15th. Expected attendance: 500+. Budget: $5,000",
    },
    {
      id: "a2",
      title: "Reimbursement Request - Office Supplies",
      type: "Reimbursement",
      submittedBy: "Amir Khan (Team Member)",
      portfolio: "Finance",
      status: "pending",
      submittedDate: "2024-05-28",
      amount: 250,
      description: "Office supplies purchased for Events portfolio tasks",
    },
    {
      id: "a3",
      title: "Marketing Budget Increase",
      type: "Budget Request",
      submittedBy: "Hassan Ibrahim (VP - Marketing)",
      portfolio: "Marketing",
      status: "pending",
      submittedDate: "2024-05-29",
      amount: 1000,
      description:
        "Additional budget needed for social media campaign and promotional materials",
    },
    {
      id: "a4",
      title: "Quarterly Finance Report",
      type: "Financial Report",
      submittedBy: "Mohammad Hassan (VP - Finance)",
      portfolio: "Finance",
      status: "approved",
      submittedDate: "2024-05-20",
      description: "Q2 financial summary and reconciliation report",
    },
    {
      id: "a5",
      title: "Partnership Agreement - Local Business",
      type: "Partnership",
      submittedBy: "Layla Hassan (VP - Externals)",
      portfolio: "Externals",
      status: "approved",
      submittedDate: "2024-05-15",
      description:
        "Partnership agreement with ABC Company for sponsorship and collaboration",
    },
  ];

  if (user?.role !== "co-president") {
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
              Access Restricted
            </h1>
            <p className="text-gray-600 mt-2">
              Only Co-Presidents can access the approvals panel.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const filteredApprovals =
    filter === "all"
      ? approvals
      : approvals.filter((a) => a.status === filter);

  const pendingCount = approvals.filter((a) => a.status === "pending").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Approvals</h1>
          <p className="text-gray-600">
            Review and approve submissions from all portfolios
          </p>
        </div>

        {/* Alert Banner */}
        {pendingCount > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900">
                {pendingCount} Pending Approvals
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                You have {pendingCount} submission{pendingCount !== 1 ? "s" : ""}{" "}
                waiting for your review.
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {["all", "pending", "approved"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as "all" | "pending" | "approved")}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors capitalize ${
                filter === f
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {f}
              {f === "pending" && ` (${pendingCount})`}
            </button>
          ))}
        </div>

        {/* Approvals List */}
        <div className="space-y-4">
          {filteredApprovals.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-gray-600 font-semibold">All Caught Up!</p>
              <p className="text-sm text-gray-500 mt-1">
                No {filter} submissions at the moment.
              </p>
            </div>
          ) : (
            filteredApprovals.map((approval) => (
              <div
                key={approval.id}
                className={`bg-white rounded-lg border-l-4 p-6 cursor-pointer hover:shadow-lg transition-shadow ${
                  approval.status === "pending"
                    ? "border-l-yellow-400"
                    : approval.status === "approved"
                      ? "border-l-green-400"
                      : "border-l-red-400"
                }`}
                onClick={() => setSelectedApproval(approval)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {approval.title}
                      </h3>
                      <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {approval.type}
                      </span>
                      <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-700 rounded">
                        {approval.portfolio}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      From {approval.submittedBy}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        approval.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : approval.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {approval.status.charAt(0).toUpperCase() +
                        approval.status.slice(1)}
                    </span>
                    <Eye className="w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{approval.description}</p>

                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>
                    Submitted on{" "}
                    {new Date(approval.submittedDate).toLocaleDateString()}
                  </span>
                  {approval.amount && (
                    <span className="font-semibold text-gray-700">
                      ${approval.amount.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Approval Modal */}
        {selectedApproval && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedApproval.title}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    From {selectedApproval.submittedBy}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedApproval(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4 mb-8 pb-8 border-b border-gray-200">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">
                    Type
                  </p>
                  <p className="text-gray-900">{selectedApproval.type}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">
                    Portfolio
                  </p>
                  <p className="text-gray-900">{selectedApproval.portfolio}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">
                    Description
                  </p>
                  <p className="text-gray-900">{selectedApproval.description}</p>
                </div>
                {selectedApproval.amount && (
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">
                      Amount
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      ${selectedApproval.amount.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {selectedApproval.status === "pending" && (
                <div className="flex gap-4">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors">
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => setSelectedApproval(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}

              {selectedApproval.status !== "pending" && (
                <div className="flex gap-4">
                  <button
                    onClick={() => setSelectedApproval(null)}
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
