"use client";

export function WelcomeHero() {
  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10"
      aria-labelledby="welcome-heading"
    >
      <h1 id="welcome-heading" className="text-2xl font-semibold text-slate-900 sm:text-3xl">
        Sustainability Self-Assessment (SAQ) Tool
      </h1>
      <p className="mt-3 text-base leading-relaxed text-slate-700 sm:text-lg">
        A structured self-assessment tool that helps organisations evaluate their sustainability
        maturity, identify improvement gaps, prioritise actions, and prepare a baseline for
        certification, standards alignment, regulatory readiness, and strategic sustainability
        planning. The SAQ is <strong>not</strong> a certification system, rather it supports preparation
        and planning so you can get ready for audits, directives, or internal goals.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {/* Who it's for */}
        <div className="rounded-xl bg-slate-50/80 px-5 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Who it&apos;s for
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            <strong>Research Infrastructures</strong>, <strong>Datacenters</strong>,{" "}
            <strong>Digital Infrastructures</strong>, and <strong>Organisations</strong> that need
            to understand their sustainability status and prepare for certification, standards,
            regulations, directives, or internal improvement planning.
          </p>
        </div>

        {/* What you get (outputs) */}
        <div className="rounded-xl bg-slate-50/80 px-5 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            What you get
          </h2>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
            <li>• Results overview: completion, capability levels, targets met</li>
            <li>• Priority summary: high / medium / low improvement priorities</li>
            <li>• Action plan: recommended actions with effort and implementation priority</li>
            <li>• Print-friendly report: for stakeholders and certification-baseline discussion</li>
          </ul>
        </div>

        {/* How it helps — full width for emphasis */}
        <div className="sm:col-span-2 rounded-xl border border-emerald-200 bg-emerald-50/50 px-5 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-800">
            How it helps
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            Use the SAQ to <strong>assess your current sustainability capability level</strong>,{" "}
            identify gaps and weak areas, understand improvement priorities and recommended actions,
            and estimate implementation effort. The outputs give you a structured baseline for
            future certification or standards-alignment pathways (e.g. ISO, ITU, etc.), regulatory readiness (e.g. EU
            directives), and internal sustainability strategy, so you can prioritise what to do next.
          </p>
        </div>
      </div>
    </section>
  );
}
