import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string };
}) {
  return (
    <main className="min-h-screen bg-slate-50">
      <LoginForm nextPath={searchParams.next} initialAuthError={searchParams.error} />
    </main>
  );
}
