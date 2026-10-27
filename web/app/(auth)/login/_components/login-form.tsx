"use client";

import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useState } from "react";

import { Credentials, credentialsSchema } from "@radarstock/contracts";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<Credentials>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: Credentials) {
    setServerError(null);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setServerError(result.message ?? "Não foi possivel realizar o login.");
        return;
      }

      router.push("/dashboard");
    } catch {
      setServerError("Não foi possível conectar ao servidor. Tente novamente.");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field data-invalid={!!form.formState.errors.email}>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="voce@exemplo.com"
            aria-invalid={!!form.formState.errors.email}
            {...form.register("email")}
          />

          {form.formState.errors.email && (
            <FieldError errors={[form.formState.errors.email]} />
          )}
        </Field>

        <Field data-invalid={!!form.formState.errors.password}>
          <FieldLabel htmlFor="password">Senha</FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!form.formState.errors.password}
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <FieldError errors={[form.formState.errors.password]} />
          )}
        </Field>

        {serverError && (
          <p role="alert" className="text-sm text-destructive">
            {serverError}
          </p>
        )}

        <Field orientation="horizontal">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full"
          >
            {form.formState.isSubmitting ? "Entrando..." : "Entrar"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
