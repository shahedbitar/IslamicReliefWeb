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
export const INVITED_USERS: InvitedUser[] = [
  {
    email: "admin@islamicreliefcanada.org",
    name: "Admin",
    roles: ["co_president"],
  },
  {
    email: "finance@islamicreliefcanada.org",
    name: "Finance Lead",
    roles: ["vp_finance"],
  },
  {
    email: "events@islamicreliefcanada.org",
    name: "Events Coordinator",
    roles: ["exec_events"],
  },
  {
    email: "shahedbitar4@gmail.com",
    name: "Shahed Bitar",
    roles: ["co_president"],
  },  {
    email: "shahedbitar4@hotmail.com",
    name: "Shahed Bitars",
    roles: ["co_president"],
  },
  {
    email: "rayankhxn1@gmail.com",
    name: "Rayan Khan",
    roles: ["vp_charity"],
  },
  {
    email: "zooal.rammahi@gmail.com",
    name: "Zainab Al-Rammahi",
    roles: ["vp_advocacy"],
  },
  {
    email: "ayeeshassan22@gmail.com",
    name: "Ayesha Hassan",
    roles: ["vp_finance"],
  },
  {
    email: "asibanoori@hotmail.com",
    name: "Asiba Noori",
    roles: ["vp_internals"],
  },
  {
    email: "kamalfayzan@gmail.com",
    name: "Fayzan Kamal",
    roles: ["co_president"],
  },
  {
    email: "iammaham082@gmail.com",
    name: "Maham Khan",
    roles: ["co_president"],
  },
  {
    email: "isakhan2215@gmail.com",
    name: "Isa Khan",
    roles: ["vp_externals"],
  },
  {
    email: "tareksosy7@gmail.com",
    name: "Tala Areksosy",
    roles: ["vp_marketing"],
  },
  {
    email: "eshal7raza@gmail.com",
    name: "Eshal Raza",
    roles: ["vp_events"],
  },
  // Add more invited users here with their roles
  // {
  //   email: "user@example.com",
  //   name: "User Name",
  //   roles: ["team-member"],
  // },
];

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
