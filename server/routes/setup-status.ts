import { RequestHandler } from "express";

interface SetupStatusResponse {
  ready: boolean;
  checks: {
    neonDatabaseUrl: boolean;
    netlifySiteUrl: boolean;
    jwtSecretPresent: boolean;
  };
  missing: string[];
  notes: string[];
}

/**
 * GET /api/setup/status
 *
 * Lightweight diagnostics endpoint so deployers can confirm required env vars.
 */
export const getSetupStatus: RequestHandler = (_req, res) => {
  const neonDatabaseUrl = Boolean(
    process.env.NEON_DATABASE_URL ||
      process.env.DATABASE_URL ||
      process.env.NETLIFY_DATABASE_URL ||
      process.env.NETLIFY_DATABASE_URL_UNPOOLED,
  );
  const netlifySiteUrl = Boolean(process.env.URL || process.env.SITE_URL);
  const jwtSecretPresent = Boolean(process.env.JWT_SECRET || process.env.NETLIFY_JWT_SECRET);

  const missing: string[] = [];

  if (!neonDatabaseUrl) {
    missing.push(
      "NEON_DATABASE_URL / DATABASE_URL / NETLIFY_DATABASE_URL / NETLIFY_DATABASE_URL_UNPOOLED",
    );
  }

  if (!netlifySiteUrl) {
    missing.push("URL (or SITE_URL)");
  }

  if (!jwtSecretPresent) {
    missing.push("JWT_SECRET (or NETLIFY_JWT_SECRET)");
  }

  const response: SetupStatusResponse = {
    ready: missing.length === 0,
    checks: {
      neonDatabaseUrl,
      netlifySiteUrl,
      jwtSecretPresent,
    },
    missing,
    notes: [
      "This endpoint validates environment setup only.",
      "Data persistence still requires implementing app CRUD routes backed by Neon.",
    ],
  };

  res.json(response);
};
