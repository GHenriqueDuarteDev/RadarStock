import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RegisterForm } from "./_components/register-form";

export default function RegisterPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Registrar</CardTitle>
        <CardDescription>Preencha os dados se cadastrar.</CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
    </Card>
  );
}
