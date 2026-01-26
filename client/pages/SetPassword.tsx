import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import GoTrue from "gotrue-js";
import SetPasswordForm from "@/components/SetPasswordForm";

function getHashParams(hash: string) {
  const h = hash.startsWith("#") ? hash.slice(1) : hash;
  return new URLSearchParams(h);
}

export default function SetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(false);

  // Email typing vs submitted email
  const [enteredEmail, setEnteredEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");

  const [info, setInfo] = useState<string>("");
  const [error, setError] = useState<string>("");

  const tokens = useMemo(() => {
    const hashParams = getHashParams(location.hash);
    const searchParams = new URLSearchParams(location.search);

    return {
      inviteToken: hashParams.get("invite_token") || searchParams.get("invite_token") || "",
      recoveryToken: hashParams.get("recovery_token") || searchParams.get("recovery_token") || "",
      emailFromQuery: hashParams.get("email") || searchParams.get("email") || "",
    };
  }, [location.hash, location.search]);

  const auth = useMemo(() => {
    const APIUrl = `${window.location.origin}/.netlify/identity`;
    return new GoTrue({ APIUrl, setCookie: true });
  }, []);

  useEffect(() => {
    if (!submittedEmail && tokens.emailFromQuery) {
      setSubmittedEmail(tokens.emailFromQuery);
    }
  }, [submittedEmail, tokens.emailFromQuery]);

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

    setIsLoading(true);
    try {
      // Sends recovery email (password setup link). Only works if the user exists in Netlify Identity.
      await auth.requestPasswordRecovery(email);
      setSubmittedEmail(email);
      setInfo("Check your email for a password setup link.");
    } catch (err: any) {
      setError(err?.message || "Could not send password email.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPassword = async (newPassword: string) => {
    setIsLoading(true);
    setError("");
    setInfo("");

    try {
      // Recovery token flow: confirm token, then update password (REAL password)
      if (tokens.recoveryToken) {
        await auth.recover(tokens.recoveryToken);
        const user = auth.currentUser();
        if (!user) throw new Error("No user session found after recovery.");
        await user.update({ password: newPassword });

        setInfo("Password set! You can now log in.");
        navigate("/login", { state: { email: emailToUse, passwordSet: true } });
        return;
      }

      // Invite token flow: best handled by Netlify Identity invite link UI (or widget)
      if (tokens.inviteToken) {
        setError(
          "This is an invite link. Use the Netlify Identity invite flow to set the password (the invite email link)."
        );
        return;
      }

      setError("Please use the password setup link sent to your email.");
    } catch (err: any) {
      setError(err?.message || "Failed to set password.");
    } finally {
      setIsLoading(false);
    }
  };

  if (tokens.inviteToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invitation Link</h1>
          <p className="text-gray-600 mb-4">
            This is an invite link. Use the invite email flow to set your password.
          </p>
          <a href="/login" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
            ← Back to Login
          </a>
        </div>
      </div>
    );
  }

  if (tokens.recoveryToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center px-4 py-8">
        <SetPasswordForm
          email={emailToUse || " "}
          onSubmit={handleSetPassword}
          onCancel={() => navigate("/login")}
          isLoading={isLoading}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-blue-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Set Your Password</h1>
          <p className="text-gray-600 mb-4">Enter your email. We’ll send you a secure setup link.</p>

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
              {isLoading ? "Sending..." : "Send password setup link"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <a href="/login" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
              ← Back to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
