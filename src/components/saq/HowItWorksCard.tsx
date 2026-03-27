interface HowItWorksCardProps {
  step: number;
  title: string;
  description: string;
}

export function HowItWorksCard({ step, title, description }: HowItWorksCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg font-semibold text-emerald-800">
          {step}
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        </div>
      </div>
    </div>
  );
}
