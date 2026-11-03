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

import { UserInput, userInputSchema } from "@radarstock/contracts";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

export function RegisterForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<UserInput>({
    resolver: zodResolver(userInputSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: UserInput) {
    setServerError(null);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setServerError(
          result.message ?? "Não foi possivel realizar o cadastro.",
        );
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
        <Field data-invalid={!!form.formState.errors.firstName}>
          <FieldLabel htmlFor="firstName">Nome</FieldLabel>
          <Input
            id="firstName"
            type="text"
            autoComplete="given-name"
            placeholder="João"
            aria-invalid={!!form.formState.errors.firstName}
            {...form.register("firstName")}
          />

          {form.formState.errors.firstName && (
            <FieldError errors={[form.formState.errors.firstName]} />
          )}
        </Field>

        <Field data-invalid={!!form.formState.errors.lastName}>
          <FieldLabel htmlFor="lastName">Sobrenome</FieldLabel>
          <Input
            id="lastName"
            type="text"
            autoComplete="family-name"
            placeholder="Silva"
            aria-invalid={!!form.formState.errors.lastName}
            {...form.register("lastName")}
          />

          {form.formState.errors.lastName && (
            <FieldError errors={[form.formState.errors.lastName]} />
          )}
        </Field>

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
            autoComplete="new-password"
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
            {form.formState.isSubmitting ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
