import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import GoTrue from "gotrue-js";

export type UserRole = "co-president" | "vp" | "team-member" | "volunteer";
export type Portfolio =
  | "charity"
  | "events"
  | "finance"
  | "marketing"
  | "internals"
  | "advocacy"
  | "externals";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  portfolio?: Portfolio;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper: map Netlify roles -> your app role + portfolio
function mapRolesToUser(appRoles: string[], netlifyUser: any): User {
  const email = netlifyUser.email as string;

  // Example roles for in Netlify Identity:
  // - co_president
  // - vp_marketing
  // - exec_marketing

  // Base role
  let role: UserRole = "team-member";

  if (appRoles.includes("co_president")) role = "co-president";
  else if (appRoles.some((r) => r.startsWith("vp_"))) role = "vp";
  else if (appRoles.includes("volunteer")) role = "volunteer";

  // Portfolio (for team-member or vp)
  const vpRole = appRoles.find((r) => r.startsWith("vp_"));
  const execRole = appRoles.find((r) => r.startsWith("exec_"));

  const portfolioStr =
    (vpRole ? vpRole.replace("vp_", "") : execRole ? execRole.replace("exec_", "") : undefined) as
      | Portfolio
      | undefined;

  return {
    id: netlifyUser.id,
    email,
    name: netlifyUser.user_metadata?.full_name || email,
    role,
    portfolio: portfolioStr,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Netlify Identity (GoTrue) client
  const auth = useMemo(() => {
    // Works on Netlify: /.netlify/identity is the right endpoint
    const APIUrl = `${window.location.origin}/.netlify/identity`;
    return new GoTrue({ APIUrl, setCookie: true });
  }, []);

  // Load existing session on refresh
  useEffect(() => {
    (async () => {
      try {
        const current = auth.currentUser();
        if (current) {
          const roles = current.app_metadata?.roles || [];
          const mapped = mapRolesToUser(roles, current);
          setUser(mapped);
          localStorage.setItem("irc_user", JSON.stringify(mapped));
        } else {
          setUser(null);
          localStorage.removeItem("irc_user");
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, [auth]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Real login against Netlify Identity
      const loggedIn = await auth.login(email, password, true);

      const roles = loggedIn.app_metadata?.roles || [];
      const mapped = mapRolesToUser(roles, loggedIn);

      setUser(mapped);
      localStorage.setItem("irc_user", JSON.stringify(mapped));
    } catch (error) {
      setUser(null);
      localStorage.removeItem("irc_user");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    try {
      auth.currentUser()?.logout();
    } catch {
      // ignore
    }
    setUser(null);
    localStorage.removeItem("irc_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
