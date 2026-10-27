import { RegisterForm } from "./_components/register-form";

export default function RegisterPage() {
  return (
    <main className="w-full max-w-sm space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Registrar</h1>
      <RegisterForm />
    </main>
  );
}
