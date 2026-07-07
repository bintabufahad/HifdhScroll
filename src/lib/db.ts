import { Pool } from "pg";

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

let schemaReady: Promise<void> | null = null;

function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = getPool()
      .query(
        `CREATE TABLE IF NOT EXISTS waitlist_signups (
          id SERIAL PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          name TEXT,
          suggestion TEXT,
          wants_to_donate BOOLEAN NOT NULL DEFAULT FALSE,
          trial_starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          trial_ends_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '14 days'),
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );`
      )
      .then(() => undefined);
  }
  return schemaReady;
}

export interface SignupInput {
  email: string;
  name?: string;
  suggestion?: string;
  wantsToDonate: boolean;
}

export interface SignupRow {
  email: string;
  trial_starts_at: string;
  trial_ends_at: string;
}

interface RawSignupRow {
  email: string;
  trial_starts_at: Date;
  trial_ends_at: Date;
}

/**
 * Creates a signup or, if the email already joined before, records any new
 * name/suggestion/donation interest without resetting their trial window.
 */
export async function upsertSignup(input: SignupInput): Promise<SignupRow> {
  await ensureSchema();
  // Lowercase here too (not just in the API route) so uniqueness holds regardless
  // of caller - Postgres text equality is case-sensitive by default, and without
  // this, "Foo@x.com" and "foo@x.com" would silently become two separate rows.
  const email = input.email.trim().toLowerCase();
  const result = await getPool().query(
    `INSERT INTO waitlist_signups (email, name, suggestion, wants_to_donate)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE SET
       name = COALESCE(EXCLUDED.name, waitlist_signups.name),
       suggestion = COALESCE(EXCLUDED.suggestion, waitlist_signups.suggestion),
       wants_to_donate = waitlist_signups.wants_to_donate OR EXCLUDED.wants_to_donate
     RETURNING email, trial_starts_at, trial_ends_at;`,
    [email, input.name ?? null, input.suggestion ?? null, input.wantsToDonate]
  );
  // node-postgres parses timestamptz columns into Date objects, not strings -
  // convert explicitly so the return type matches its declared shape exactly,
  // rather than relying on JSON.stringify's implicit Date-to-string behavior.
  const row = result.rows[0] as RawSignupRow;
  return {
    email: row.email,
    trial_starts_at: row.trial_starts_at.toISOString(),
    trial_ends_at: row.trial_ends_at.toISOString(),
  };
}
