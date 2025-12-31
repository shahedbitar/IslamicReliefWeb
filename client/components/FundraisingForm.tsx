import { useState } from "react";
import { useEvent } from "@/contexts/EventContext";
import { useAuth } from "@/contexts/AuthContext";
import { X, DollarSign } from "lucide-react";

interface FundraisingFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FundraisingForm({ isOpen, onClose }: FundraisingFormProps) {
  const { user } = useAuth();
  const { createFundraisingEntry } = useEvent();
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    source: "Event",
    date: new Date().toISOString().split('T')[0],
    notes: "",
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.amount) {
      alert("Please fill in all required fields");
      return;
    }

    createFundraisingEntry({
      title: formData.title,
      amount: parseFloat(formData.amount),
      source: formData.source,
      date: formData.date,
      notes: formData.notes,
      submittedBy: user?.name || "Finance",
    });

    // Reset form
    setFormData({
      title: "",
      amount: "",
      source: "Event",
      date: new Date().toISOString().split('T')[0],
      notes: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Log Money Raised
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">
              Entry Name *
            </label>
            <input
              type="text"
              placeholder="e.g., Donation Drive, Fundraising Booth"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">
              Amount (CAD) *
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">$</span>
              <input
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-500"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">
              Source
            </label>
            <select
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-500"
            >
              <option value="Event">Event</option>
              <option value="Booth">Booth</option>
              <option value="Donation">Donation</option>
              <option value="Campaign">Campaign</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">
              Notes
            </label>
            <textarea
              placeholder="Add any additional details..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-500 min-h-20"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Log Money
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
