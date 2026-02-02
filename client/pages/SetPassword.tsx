import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import GoTrue from "gotrue-js";
import SetPasswordForm from "@/components/SetPasswordForm";
import { getInvitedUserInfo } from "@shared/invites";

export default function SetPassword() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [enteredEmail, setEnteredEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [step, setStep] = useState<"email" | "password">("email");

  const [info, setInfo] = useState("");
  const [error, setError] = useState("");

  const auth = useMemo(() => {
    const APIUrl = `${window.location.origin}/.netlify/identity`;
    return new GoTrue({ APIUrl, setCookie: true });
  }, []);

  const emailToUse = submittedEmail;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");

    const email = enteredEmail.trim().toLowerCase();
    if (!email.includes("@")) {
      setError("Please enter a valid email.");
      return;
    }

    // Check if email is invited
    const invitedUser = getInvitedUserInfo(email);
    if (!invitedUser) {
      setError(
        "This email is not invited. Please contact the administrator to request access.",
      );
      return;
    }

    setIsLoading(true);
    setSubmittedEmail(email);
    setStep("password");
    setIsLoading(false);
  };

  const handleSetPassword = async (newPassword: string) => {
    setIsLoading(true);
    setError("");
    setInfo("");

    try {
      const created = await auth.signup(emailToUse, newPassword, {
        full_name: emailToUse,
      });
      try {
        await created.logout();
      } catch {
        // ignore logout errors
      }
      navigate("/login", { state: { email: emailToUse, passwordSet: true } });
      return;
    } catch (err: any) {
      const message = err?.message || "Failed to set password.";
      if (message.toLowerCase().includes("already")) {
        setError("Account already exists. Please sign in.");
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "password") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center px-4 py-8">
        <SetPasswordForm
          email={emailToUse || " "}
          onSubmit={handleSetPassword}
          onCancel={() => {
            setStep("email");
            setSubmittedEmail("");
          }}
          isLoading={isLoading}
        />
      </div>
    );
  }

  // Default: email entry -> validate invite list
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-blue-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Enter your email
          </h1>
          <p className="text-gray-600 mb-4">
            We’ll verify your invite and continue to set your password.
          </p>

          {info && <p className="text-sm text-green-700 mb-3">{info}</p>}
          {error && <p className="text-sm text-red-700 mb-3">{error}</p>}

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
              disabled={isLoading}
              className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {isLoading ? "Checking..." : "Continue"}
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
