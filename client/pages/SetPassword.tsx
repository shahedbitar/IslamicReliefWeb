import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail } from "lucide-react";
import SetPasswordForm from "@/components/SetPasswordForm";

export default function SetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [enteredEmail, setEnteredEmail] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);

  // Get email from route state or query params
  const email =
    (location.state as any)?.email ||
    new URLSearchParams(location.search).get("email") ||
    enteredEmail ||
    "";

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredEmail.includes("@")) {
      setShowEmailInput(false);
    }
  };

  if (!email && !showEmailInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Set Your Password</h1>
            <p className="text-gray-600 mb-4">
              Enter your email address to get started
            </p>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={enteredEmail}
                  onChange={(e) => setEnteredEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <a
                href="/login"
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                ← Back to Login
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSetPassword = async (password: string) => {
    setIsLoading(true);
    try {
      // TODO: Integrate with Netlify Identity API
      // const response = await fetch('/.netlify/identity/password-set', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password }),
      // });
      // if (!response.ok) throw new Error('Failed to set password');

      // For now, store in localStorage and redirect to login
      localStorage.setItem("user_password_set", "true");
      navigate("/login", {
        state: { email, passwordSet: true },
      });
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center px-4 py-8">
      <SetPasswordForm
        email={email}
        onSubmit={handleSetPassword}
        onCancel={() => navigate("/login")}
        isLoading={isLoading}
      />
    </div>
  );
}
