# Invite-Only Authentication System

This project uses an invite-only login system with password-based authentication via Netlify Identity.

## How It Works

### 1. **Setup: Add Invited Users**

Edit `/shared/invites.ts` and add users with their emails and roles:

```typescript
export const INVITED_USERS: InvitedUser[] = [
  {
    email: "admin@islamicreliefcanada.org",
    name: "Admin Name",
    roles: ["co_president"],
  },
  {
    email: "finance@islamicreliefcanada.org",
    name: "Finance Lead",
    roles: ["vp_finance"],
  },
  // Add more users here
];
```

### 2. **Role Conventions**

Users can have one or more roles:

- **`co_president`** - Full access to all portfolios and approvals
- **`vp_<portfolio>`** - VP for a portfolio (finance, events, charity, etc.) - full access to that portfolio
- **`exec_<portfolio>`** - Executive lead for a portfolio - full access
- **`volunteer`** - Limited access, no approvals

Example roles:

```typescript
roles: ["vp_finance", "exec_charity"]; // VP of Finance + Exec of Charity
```

### 3. **Login Flow**

1. **User enters email + password** on `/login`
2. **System checks if email is in invite list** - if not, login fails with error message
3. **If invited, Netlify Identity validates password** - Netlify handles password verification
4. **User is logged in** with roles from the invite list

### 4. **First-Time User Setup**

1. Admin adds user email to `INVITED_USERS` in `/shared/invites.ts`
2. User goes to `/set-password`
3. User enters their email (which is in the invite list)
4. System sends password setup email
5. User clicks link and sets their password
6. User logs in with that password

## Security Notes

- **No passwords are hardcoded** - Netlify Identity handles secure password storage
- **Email whitelist is checked on every login attempt** - unauthorized emails cannot login
- **Roles are embedded in code** - you control who has access at deployment time
- **This is invite-only** - only pre-approved emails can access the system

## Development

To test locally:

1. Ensure Netlify Identity is configured
2. Add test emails to `INVITED_USERS`
3. Run `npm run dev`
4. Navigate to `/login` to test

## Deployment to Netlify

1. Connect your site to Netlify
2. Netlify Identity must be enabled in your Netlify site settings
3. Update `INVITED_USERS` as needed and push to main
4. Deploy using the MCP tools or Netlify dashboard

## Troubleshooting

**"Email not invited" error on login:**

- Check that the email is in the `INVITED_USERS` array in `/shared/invites.ts`
- Ensure email matches exactly (case-insensitive, but must match)

**Password setup email not arriving:**

- Check spam folder
- Verify Netlify Identity is enabled on your site
- Ensure the email is in the invite list

**User can't set password:**

- User email must be in `INVITED_USERS`
- Netlify Identity email notifications must be enabled

## Files Modified

- `/shared/invites.ts` - Hardcoded invite list with roles
- `/server/routes/auth.ts` - API endpoint to check invites
- `/client/contexts/AuthContext.tsx` - Login validation against invite list
- `/client/pages/Login.tsx` - Clearer UI messaging
- `/client/pages/SetPassword.tsx` - Invite validation on password setup
