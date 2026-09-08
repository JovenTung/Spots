"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin, EnvelopeSimple } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

const authSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});

type AuthValues = z.infer<typeof authSchema>;
type Mode = "sign_in" | "sign_up";

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>("sign_in");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthValues>({ resolver: zodResolver(authSchema) });

  const confirmationError = searchParams.get("error") === "confirmation_failed";

  const onSubmit = async (values: AuthValues) => {
    setIsSubmitting(true);
    const supabase = createClient();

    if (mode === "sign_in") {
      const { error } = await supabase.auth.signInWithPassword(values);
      if (error) {
        toast.error(error.message);
        setIsSubmitting(false);
        return;
      }
      router.replace("/places");
      router.refresh();
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      ...values,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    if (error) {
      toast.error(error.message);
      setIsSubmitting(false);
      return;
    }
    if (data.session) {
      router.replace("/places");
      router.refresh();
      return;
    }
    setAwaitingConfirmation(true);
    setIsSubmitting(false);
  };

  if (awaitingConfirmation) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-border p-8 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
          <EnvelopeSimple size={24} className="text-accent-foreground" />
        </span>
        <h2 className="text-lg font-semibold">Check your email</h2>
        <p className="text-sm text-muted-foreground">
          We sent you a confirmation link. Tap it on this device to finish
          signing up.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
          <MapPin size={26} weight="fill" className="text-primary-foreground" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold">Spots</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Places you love. Places you&apos;ll go.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 rounded-lg border border-border p-6"
      >
        {confirmationError && (
          <p className="rounded-md bg-accent px-4 py-3 text-sm text-accent-foreground">
            That confirmation link didn&apos;t work — try signing in, or sign up
            again.
          </p>
        )}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            className="h-12"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete={mode === "sign_in" ? "current-password" : "new-password"}
            placeholder="••••••••"
            className="h-12"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 h-12 rounded-full text-base"
        >
          {isSubmitting
            ? "One sec…"
            : mode === "sign_in"
              ? "Sign in"
              : "Create account"}
        </Button>
        <button
          type="button"
          onClick={() => setMode(mode === "sign_in" ? "sign_up" : "sign_in")}
          className="min-h-11 text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          {mode === "sign_in"
            ? "New here? Create an account"
            : "Already have an account? Sign in"}
        </button>
      </form>
    </div>
  );
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
