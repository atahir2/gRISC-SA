"use server";

import { createClient } from "@/src/lib/supabase/server";

type BundleRow = {
  id: string;
  organisation_name: string;
  created_at: string;
  updated_at: string;
};

function isBundleRow(v: unknown): v is BundleRow {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.organisation_name === "string" &&
    typeof o.created_at === "string" &&
    typeof o.updated_at === "string"
  );
}

/**
 * Creates an assessment via `create_assessment_bundle` RPC (see migrations).
 * Uses `getSession` + `setSession` so PostgREST sends the JWT (getUser() alone is not enough).
 */
export async function createAssessmentAction(organisationName: string) {
  const name = organisationName.trim();
  if (!name) {
    throw new Error("Organisation name is required.");
  }

  const supabase = await createClient();

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    throw new Error(sessionError.message);
  }
  const session = sessionData.session;
  if (!session?.access_token || !session.user) {
    throw new Error("Authentication required");
  }

  const { error: setErr } = await supabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });
  if (setErr) {
    throw new Error(setErr.message);
  }

  const { data: rpcData, error: rpcError } = await supabase.rpc("create_assessment_bundle", {
    p_organisation_name: name,
  });

  if (rpcError) {
    let msg = rpcError.message;
    if (msg.includes("Could not find") || msg.includes("does not exist")) {
      msg +=
        " Apply the migration supabase/migrations/20250406120000_create_assessment_bundle_rpc.sql to your project.";
    }
    throw new Error(msg);
  }

  const parsed =
    typeof rpcData === "string"
      ? (JSON.parse(rpcData) as unknown)
      : rpcData;

  if (!isBundleRow(parsed)) {
    throw new Error("Unexpected response from create_assessment_bundle.");
  }

  return {
    id: parsed.id,
    organisationName: parsed.organisation_name,
    createdAt: parsed.created_at,
    updatedAt: parsed.updated_at,
  };
}
