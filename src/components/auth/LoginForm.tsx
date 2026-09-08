"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { clsx } from "@/lib/clsx";
import { signIn, signUp, type AuthActionState } from "@/app/login/actions";

const INITIAL_STATE: AuthActionState = { status: "idle", message: null };

export function LoginForm({ next }: { next?: string }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loginState, loginAction, loginPending] = useActionState(signIn, INITIAL_STATE);
  const [signupState, signupAction, signupPending] = useActionState(signUp, INITIAL_STATE);

  const state = mode === "login" ? loginState : signupState;
  const pending = mode === "login" ? loginPending : signupPending;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex rounded-[var(--radius-control)] border border-border bg-surface p-1">
        <TabButton active={mode === "login"} onClick={() => setMode("login")}>
          Iniciar sesión
        </TabButton>
        <TabButton active={mode === "signup"} onClick={() => setMode("signup")}>
          Crear cuenta
        </TabButton>
      </div>

      <form action={mode === "login" ? loginAction : signupAction} className="flex flex-col gap-3">
        {next ? <input type="hidden" name="next" value={next} /> : null}
        {mode === "signup" ? (
          <Field label="Nombre" htmlFor="displayName">
            <input
              id="displayName"
              name="displayName"
              required
              autoComplete="name"
              className="h-12 w-full rounded-[var(--radius-control)] border border-border bg-white px-4 text-[15px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </Field>
        ) : null}

        <Field label="Correo electrónico" htmlFor="email">
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="h-12 w-full rounded-[var(--radius-control)] border border-border bg-white px-4 text-[15px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </Field>

        <Field label="Contraseña" htmlFor="password">
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className="h-12 w-full rounded-[var(--radius-control)] border border-border bg-white px-4 text-[15px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </Field>

        {state.status !== "idle" ? (
          <p
            role="alert"
            className={clsx(
              "text-sm",
              state.status === "error" ? "text-danger" : "text-accent"
            )}
          >
            {state.message}
          </p>
        ) : null}

        <Button type="submit" fullWidth disabled={pending}>
          {pending
            ? "Un momento…"
            : mode === "login"
              ? "Iniciar sesión"
              : "Crear cuenta"}
        </Button>
      </form>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "flex-1 rounded-[var(--radius-control)] px-4 py-2 text-sm font-medium transition-colors",
        active ? "bg-primary text-primary-foreground" : "text-muted hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-muted">
        {label}
      </label>
      {children}
    </div>
  );
}
