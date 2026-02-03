/**
 * Hardcoded list of invited users with their roles
 * Each email can have multiple roles for fine-grained permissions
 */

export type UserRole = "co-president" | "vp" | "team-member" | "volunteer";
export type Portfolio =
  | "charity"
  | "events"
  | "finance"
  | "marketing"
  | "internals"
  | "advocacy"
  | "externals";

export interface InvitedUser {
  email: string;
  name: string;
  roles: string[]; // e.g., ["co_president"] or ["vp_finance", "exec_charity"]
}

/**
 * HARDCODED INVITES - Add your invited users here
 * Role conventions:
 * - "co_president" => Full access to all portfolios
 * - "vp_<portfolio>" => VP for a specific portfolio (full access to that portfolio)
 * - "exec_<portfolio>" => Executive lead for a portfolio (full access)
 * - "volunteer" => Limited access, no approvals
 */
export const INVITED_USERS: InvitedUser[] = [];

/**
 * Check if an email is in the invite list
 */
export function isEmailInvited(email: string): InvitedUser | null {
  const normalized = email.trim().toLowerCase();
  return (
    INVITED_USERS.find((u) => u.email.toLowerCase() === normalized) || null
  );
}

/**
 * Get user info from invite list
 */
export function getInvitedUserInfo(email: string): InvitedUser | null {
  return isEmailInvited(email);
}
