import { useState } from "react";
import { Lock, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";

interface SetPasswordFormProps {
  email: string;
  onSubmit: (password: string) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const PasswordStrength = ({ password }: { password: string }) => {
  const getStrength = () => {
    if (!password) return { score: 0, label: "", color: "bg-gray-200" };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score === 0) return { score: 0, label: "Very weak", color: "bg-red-500" };
    if (score <= 2) return { score: 1, label: "Weak", color: "bg-orange-500" };
    if (score <= 3) return { score: 2, label: "Fair", color: "bg-yellow-500" };
    if (score <= 4) return { score: 3, label: "Good", color: "bg-blue-500" };
    return { score: 4, label: "Strong", color: "bg-green-500" };
  };

  const strength = getStrength();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-700">Password Strength</span>
        {password && (
          <span className={`text-xs font-semibold ${strength.color === "bg-red-500" ? "text-red-600" : strength.color === "bg-orange-500" ? "text-orange-600" : strength.color === "bg-yellow-500" ? "text-yellow-600" : strength.color === "bg-blue-500" ? "text-blue-600" : "text-green-600"}`}>
            {strength.label}
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${strength.color} ${
            strength.score === 0 ? "w-0" : strength.score === 1 ? "w-1/4" : strength.score === 2 ? "w-1/2" : strength.score === 3 ? "w-3/4" : "w-full"
          }`}
        />
      </div>
    </div>
  );
};

const PasswordRequirements = ({ password }: { password: string }) => {
  const checks = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains uppercase letter (A-Z)", met: /[A-Z]/.test(password) },
    { label: "Contains number (0-9)", met: /[0-9]/.test(password) },
    { label: "Contains special character (!@#$%)", met: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-700">Requirements:</p>
      <div className="space-y-1">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center gap-2 text-xs">
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                check.met ? "bg-green-100" : "bg-gray-100"
              }`}
            >
              {check.met && <CheckCircle className="w-3 h-3 text-green-600" />}
            </div>
            <span className={check.met ? "text-gray-700" : "text-gray-500"}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function SetPasswordForm({
  email,
  onSubmit,
  onCancel,
  isLoading = false,
}: SetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isPasswordValid = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
  const passwordsMatch = password === confirmPassword;
  const canSubmit = isPasswordValid && passwordsMatch && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isPasswordValid) {
      setError("Password does not meet all requirements");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Set Your Password</h2>
          <p className="text-sm text-gray-600">Create a secure password for your account</p>
          <p className="text-xs text-gray-500 mt-2">{email}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                  confirmPassword
                    ? passwordsMatch
                      ? "border-green-300 focus:ring-green-600"
                      : "border-red-300 focus:ring-red-600"
                    : "border-gray-300 focus:ring-blue-600"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {confirmPassword && !passwordsMatch && (
              <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
            )}
          </div>

          {password && (
            <>
              <PasswordStrength password={password} />
              <PasswordRequirements password={password} />
            </>
          )}

          <div className="flex gap-3 pt-4">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={submitting}
                className="flex-1 py-2 border border-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex-1 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 cursor-pointer"
            >
              {submitting ? "Setting Password..." : "Set Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
