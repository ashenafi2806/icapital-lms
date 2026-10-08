"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldsReady, setFieldsReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const clearCredentials = () => {
      setEmail("");
      setPassword("");
      setShowPassword(false);
      setFieldsReady(false);
      if (emailInputRef.current) {
        emailInputRef.current.value = "";
      }
      if (passwordInputRef.current) {
        passwordInputRef.current.value = "";
      }
    };

    clearCredentials();
    window.addEventListener("lms:logout", clearCredentials);
    const clearAutofill = window.setTimeout(clearCredentials, 100);

    return () => {
      window.clearTimeout(clearAutofill);
      window.removeEventListener("lms:logout", clearCredentials);
    };
  }, []);

  useEffect(() => {
    if (!loading && user?.role === "ADMIN") {
      router.replace("/courses");
    }
  }, [loading, router, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace("/courses");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Invalid credentials");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || user?.role === "ADMIN") {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">Admin sign in</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Sign in to manage the learning platform.
        </p>
        <form
          className="mt-6 space-y-4"
          onSubmit={handleSubmit}
          autoComplete="new-password"
        >
          <label className="block text-sm font-medium text-zinc-700">
            Email
            <input
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-600"
              ref={emailInputRef}
              type="email"
              name="admin-login-email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="new-password"
              readOnly={!fieldsReady}
              onFocus={() => setFieldsReady(true)}
              required
            />
          </label>
          <label className="block text-sm font-medium text-zinc-700">
            Password
            <div className="relative mt-1">
              <input
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 pr-10 outline-none focus:border-zinc-600"
                ref={passwordInputRef}
                type={showPassword ? "text" : "password"}
                name="admin-login-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                readOnly={!fieldsReady}
                onFocus={() => setFieldsReady(true)}
                required
              />
              <button
                className="absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500 hover:text-zinc-700"
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <button
            className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
