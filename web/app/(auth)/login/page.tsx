import Link from "next/link";
import { DemoNotice } from "./_components/demo-notice";
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
    <div className="flex w-full max-w-md flex-col gap-4">
      <DemoNotice />
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Entrar</CardTitle>
          <CardDescription>
            Use as credenciais de demo ou as suas para acessar o painel.
          </CardDescription>
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
    </div>
  );
}
