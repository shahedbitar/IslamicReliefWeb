import { RequestHandler } from "express";
import { getInvitedUserInfo } from "@shared/invites";

export interface CheckInviteResponse {
  invited: boolean;
  email?: string;
  name?: string;
  roles?: string[];
  message: string;
}

/**
 * Check if an email is invited
 * POST /api/auth/check-invite
 * Body: { email: string }
 */
export const checkInvite: RequestHandler = (req, res) => {
  const { email } = req.body;

  if (!email || typeof email !== "string") {
    res.status(400).json({
      invited: false,
      message: "Email is required",
    } as CheckInviteResponse);
    return;
  }

  const invitedUser = getInvitedUserInfo(email);

  if (invitedUser) {
    res.json({
      invited: true,
      email: invitedUser.email,
      name: invitedUser.name,
      roles: invitedUser.roles,
      message: "Email is invited",
    } as CheckInviteResponse);
  } else {
    res.status(403).json({
      invited: false,
      message:
        "This email is not invited. Please contact the administrator to request access.",
    } as CheckInviteResponse);
  }
};
