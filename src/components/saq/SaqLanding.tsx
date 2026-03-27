"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createAssessment, listAssessments } from "@/src/lib/saq/assessment.repository";
import type { Assessment } from "@/src/lib/saq/assessment.types";
import { WelcomeHero } from "./WelcomeHero";
import { HowItWorksCard } from "./HowItWorksCard";
import { AssessmentListCard } from "./AssessmentListCard";
import { EmptyAssessmentsState } from "./EmptyAssessmentsState";

export function SaqLanding() {
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orgName, setOrgName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    listAssessments()
      .then(setAssessments)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load assessments"))
      .finally(() => setLoading(false));
  }, []);

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
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Welcome / introduction */}
        <WelcomeHero />

        {/* How it works */}
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

        {/* Quick start / new assessment */}
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
          {createError && (
            <p className="mt-2 text-sm text-red-600">{createError}</p>
          )}
        </section>

        {/* Existing assessments */}
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
      </div>
    </main>
  );
}
