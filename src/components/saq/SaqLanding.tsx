"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/src/lib/supabase/client";
import { createAssessment, listAssessments } from "@/src/lib/saq/assessment.repository";
import type { Assessment } from "@/src/lib/saq/assessment.types";
import { WelcomeHero } from "./WelcomeHero";
import { HowItWorksCard } from "./HowItWorksCard";
import { AssessmentListCard } from "./AssessmentListCard";
import { EmptyAssessmentsState } from "./EmptyAssessmentsState";

function displayName(session: Session): string {
  const meta = session.user.user_metadata as { full_name?: string } | undefined;
  const fromMeta = meta?.full_name?.trim();
  if (fromMeta) return fromMeta;
  return session.user.email ?? "Signed in";
}

export function SaqLanding() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orgName, setOrgName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setAuthReady(true);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (!session) {
      setAssessments([]);
      setLoading(false);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    listAssessments()
      .then((list) => {
        if (!cancelled) setAssessments(list);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load assessments");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authReady, session]);

  async function handleLogout() {
    setSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  async function handleNewAssessment(e: React.FormEvent) {
    e.preventDefault();
    const name = orgName.trim();
    if (!name) return;
    setCreating(true);
    setCreateError(null);
    try {
      const assessment = await createAssessment(name);
      router.push(`/saq/assessment/${assessment.id}`);
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Failed to create assessment");
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-sm text-slate-600">
            {!authReady ? (
              <span className="text-slate-500">Checking session…</span>
            ) : session ? (
              <span>
                Signed in as{" "}
                <span className="font-medium text-slate-900">{displayName(session)}</span>
              </span>
            ) : (
              <span className="text-slate-700">Sign in to create and manage assessments.</span>
            )}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {!authReady ? null : session ? (
              <button
                type="button"
                onClick={() => void handleLogout()}
                disabled={signingOut}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {signingOut ? "Signing out…" : "Log out"}
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <WelcomeHero />

        <section className="mt-12" aria-labelledby="how-it-works-heading">
          <h2 id="how-it-works-heading" className="text-xl font-semibold text-slate-900">
            How it works
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Four steps from scope to report, save progress anytime, and return later.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <HowItWorksCard
              step={1}
              title="Define scope and goals"
              description="Choose which topic areas are in scope and set optional target capability levels."
            />
            <HowItWorksCard
              step={2}
              title="Answer the assessment"
              description="Rate your current capability (1–3) for each in-scope question."
            />
            <HowItWorksCard
              step={3}
              title="Review dashboard and results"
              description="See completion, pass levels, targets met, and priority summaries."
            />
            <HowItWorksCard
              step={4}
              title="Generate action plan and report"
              description="Get a prioritised action plan and export a PDF report for stakeholders."
            />
          </div>
        </section>

        {!authReady ? (
          <section className="mt-12 rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-slate-500">Loading…</p>
          </section>
        ) : !session ? (
          <section
            className="mt-12 rounded-xl border border-emerald-200 bg-emerald-50/80 p-8 shadow-sm"
            aria-labelledby="sign-in-heading"
          >
            <h2 id="sign-in-heading" className="text-xl font-semibold text-slate-900">
              Sign in to use the SAQ
            </h2>
            <p className="mt-2 text-sm text-slate-700">
              Create an account or log in to start an assessment, save your answers, and access your dashboard and reports.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                Create an account
              </Link>
            </div>
          </section>
        ) : (
          <>
            <section className="mt-12 rounded-xl border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby="new-assessment-heading">
              <h2 id="new-assessment-heading" className="text-xl font-semibold text-slate-900">
                Start a new assessment
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Enter your organisation name to create an assessment. You can save progress and return later.
              </p>
              <form
                onSubmit={handleNewAssessment}
                className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
              >
                <div className="flex-1">
                  <label htmlFor="org-name" className="block text-sm font-medium text-slate-700">
                    Organisation name
                  </label>
                  <input
                    id="org-name"
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. My Research Infrastructure"
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {creating ? "Creating…" : "Start assessment"}
                </button>
              </form>
              {createError && <p className="mt-2 text-sm text-red-600">{createError}</p>}
            </section>

            <section
              className="mt-12 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
              aria-labelledby="your-assessments-heading"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <h2 id="your-assessments-heading" className="text-xl font-semibold text-slate-900">
                    Manage your assessments
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Open, resume, or view dashboard and report for your saved assessments.
                  </p>
                </div>
                {!loading && !error && assessments.length > 0 && (
                  <span className="text-sm font-medium text-slate-500 tabular-nums">
                    {assessments.length} {assessments.length === 1 ? "assessment" : "assessments"}
                  </span>
                )}
              </div>
              {loading ? (
                <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50/50 p-8 text-center">
                  <p className="text-sm text-slate-500">Loading assessments…</p>
                  <div className="mx-auto mt-3 h-1 w-24 animate-pulse rounded bg-slate-200" />
                </div>
              ) : error ? (
                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                  {error}
                </div>
              ) : assessments.length === 0 ? (
                <div className="mt-6">
                  <EmptyAssessmentsState />
                </div>
              ) : (
                <ul className="mt-6 space-y-4" role="list">
                  {assessments.map((a) => (
                    <AssessmentListCard key={a.id} assessment={a} />
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
