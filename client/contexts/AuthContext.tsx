import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import GoTrue from "gotrue-js";
import { getInvitedUserInfo } from "@shared/invites";

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

  /** High-level label for UI */
  role: UserRole;

  /** Raw Netlify roles (source of truth) */
  roles: string[];

  /** Optional “primary” portfolio for display (not for permissions) */
  portfolio?: Portfolio;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;

  /** Helpers (so you don’t repeat logic across components) */
  hasRole: (role: string) => boolean;
  canAccessPortfolio: (portfolio: Portfolio) => boolean;
  canAccessApprovals: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function extractRoles(netlifyUser: any): string[] {
  const roles = netlifyUser?.app_metadata?.roles;
  return Array.isArray(roles) ? roles : [];
}

function roleLabelFromRoles(roles: string[]): UserRole {
  if (roles.includes("co_president")) return "co-president";
  if (roles.some((r) => r.startsWith("vp_"))) return "vp";
  if (roles.includes("volunteer")) return "volunteer";
  return "team-member";
}

/**
 * Optional: pick a "primary" portfolio for display (NOT permissions)
 */
function primaryPortfolioFromRoles(roles: string[]): Portfolio | undefined {
  const vpRole = roles.find((r) => r.startsWith("vp_"));
  const execRole = roles.find((r) => r.startsWith("exec_"));

  const raw = vpRole?.replace("vp_", "") || execRole?.replace("exec_", "");
  const allowed: Portfolio[] = ["charity", "events", "finance", "marketing", "internals", "advocacy", "externals"];

  return allowed.includes(raw as Portfolio) ? (raw as Portfolio) : undefined;
}

/**
 * Permissions:
 * - co_president => all portfolios
 * - any vp_* => all portfolios
 * - exec_<portfolio> => only that portfolio
 * - (optional) volunteer => none or limited
 */
function canAccessPortfolioFromRoles(roles: string[], portfolio: Portfolio): boolean {
  if (roles.includes("co_president")) return true;
  if (roles.some((r) => r.startsWith("vp_"))) return true;

  // Exec access
  if (roles.includes(`exec_${portfolio}`)) return true;

  // If you want team members to access a portfolio too, add a role convention like:
  // member_marketing, member_events, etc. Then:
  // if (roles.includes(`member_${portfolio}`)) return true;

  return false;
}

/**
 * Example: approvals page access
 * - co_president + VPs only
 */
function canAccessApprovalsFromRoles(roles: string[]): boolean {
  if (roles.includes("co_president")) return true;
  if (roles.some((r) => r.startsWith("vp_"))) return true;
  return false;
}

function mapNetlifyUserToAppUser(netlifyUser: any): User {
  const email = normalizeEmail(netlifyUser.email as string);
  const roles = extractRoles(netlifyUser);

  return {
    id: netlifyUser.id,
    email,
    name: netlifyUser.user_metadata?.full_name || email,
    role: roleLabelFromRoles(roles),
    roles,
    portfolio: primaryPortfolioFromRoles(roles),
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const auth = useMemo(() => {
    const APIUrl = `${window.location.origin}/.netlify/identity`;
    return new GoTrue({ APIUrl, setCookie: true });
  }, []);

  // Load session on refresh
  useEffect(() => {
    try {
      const current = auth.currentUser();
      if (current) {
        const mapped = mapNetlifyUserToAppUser(current);
        setUser(mapped);
        localStorage.setItem("irc_user", JSON.stringify(mapped));
      } else {
        setUser(null);
        localStorage.removeItem("irc_user");
      }
    } finally {
      setIsLoading(false);
    }
  }, [auth]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const loggedIn = await auth.login(normalizeEmail(email), password, true);
      const mapped = mapNetlifyUserToAppUser(loggedIn);

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

  // Helpers
  const hasRole = (role: string) => {
    return !!user?.roles?.includes(role);
  };

  const canAccessPortfolio = (portfolio: Portfolio) => {
    if (!user) return false;
    return canAccessPortfolioFromRoles(user.roles, portfolio);
  };

  const canAccessApprovals = () => {
    if (!user) return false;
    return canAccessApprovalsFromRoles(user.roles);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        hasRole,
        canAccessPortfolio,
        canAccessApprovals,
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
