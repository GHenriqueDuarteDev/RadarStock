import Link from "next/link";
import { LoginForm } from "./_components/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  return (
    <Card className="w-full max-w-sm space-y-6">
      <CardHeader>
        <CardTitle>Entrar</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
      <CardFooter className="gap-1 justify-center">
        Não tem uma conta?
        <Link
          href="/register"
          className="underline underline-offset-4 hover:text-foreground"
        >
          Registre-se aqui
        </Link>
      </CardFooter>
    </Card>
  );
}
