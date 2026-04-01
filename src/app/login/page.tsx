import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  return (
    <main className="min-h-screen bg-slate-50">
      <LoginForm nextPath={searchParams.next} />
    </main>
  );
}
