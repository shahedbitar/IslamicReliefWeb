import { useState } from "react";
import { useEvent } from "@/contexts/EventContext";
import { useAuth } from "@/contexts/AuthContext";
import { X, Upload, DollarSign } from "lucide-react";

interface ReimbursementFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReimbursementForm({ isOpen, onClose }: ReimbursementFormProps) {
  const { user } = useAuth();
  const { submitReimbursement, events } = useEvent();
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    relatedEventId: "",
    receiptImage: "",
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData({ ...formData, receiptImage: base64String });
      setImagePreview(base64String);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!formData.amount || !formData.description) {
      alert("Please fill in amount and description");
      return;
    }

    if (!formData.receiptImage) {
      alert("Please upload a receipt image");
      return;
    }

    submitReimbursement({
      amount: parseFloat(formData.amount),
      description: formData.description,
      relatedEventId: formData.relatedEventId || undefined,
      receiptImage: formData.receiptImage,
      submittedBy: user?.name || "User",
      status: "pending",
    });

    // Reset form
    setFormData({
      amount: "",
      description: "",
      relatedEventId: "",
      receiptImage: "",
    });
    setImagePreview("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Submit Reimbursement
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Receipt Image Upload */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Receipt Image *
            </label>
            <div className="relative">
              {imagePreview ? (
                <div className="relative border-2 border-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Receipt preview"
                    className="w-full h-40 object-cover"
                  />
                  <button
                    onClick={() => {
                      setFormData({ ...formData, receiptImage: "" });
                      setImagePreview("");
                    }}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 font-medium">
                    {uploading ? "Uploading..." : "Click to upload receipt"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF up to 5MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">
              Amount Requested (CAD) *
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 text-lg">$</span>
              <input
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-500"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">
              Description *
            </label>
            <textarea
              placeholder="Explain what this reimbursement is for (e.g., printing costs for event materials, supplies purchased)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-500 min-h-24 resize-none"
            />
          </div>

          {/* Related Event */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">
              Related Event (Optional)
            </label>
            <select
              value={formData.relatedEventId}
              onChange={(e) => setFormData({ ...formData, relatedEventId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-500"
            >
              <option value="">No specific event</option>
              {events
                .filter(e => e.status === "approved")
                .map(event => (
                  <option key={event.id} value={event.id}>
                    {event.title} ({event.portfolio})
                  </option>
                ))}
            </select>
            {events.filter(e => e.status === "approved").length === 0 && (
              <p className="text-xs text-gray-500 mt-1">
                No approved events available. Create and approve an event first.
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={handleSubmit}
            disabled={uploading || !formData.amount || !formData.description || !formData.receiptImage}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Submit Reimbursement
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
