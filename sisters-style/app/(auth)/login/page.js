"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setBusy(false);
    if (res?.error) {
      setError("Incorrect email or password");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="font-display mb-1 text-xl font-semibold">Log In</h2>
      <p className="mb-5 text-[12.5px] text-ink-soft">Welcome back — enter your details.</p>

      <Field label="Email" type="email" value={email} onChange={setEmail} />
      <Field label="Password" type="password" value={password} onChange={setPassword} />

      {error && <p className="mb-3 text-sm font-semibold text-[#b23b34]">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-2xl bg-gradient-to-br from-clay-warm to-clay-deep py-3.5 font-extrabold text-white disabled:opacity-60"
      >
        {busy ? "Logging in…" : "Log In"}
      </button>

      <p className="mt-4 text-center text-[12.5px] text-ink-soft">
        New here?{" "}
        <Link href="/signup" className="font-bold text-clay-warm">
          Create an account
        </Link>
      </p>

      <div className="mt-4 rounded-xl bg-cream p-3 text-[11px] text-ink-soft">
        Demo admin: <strong>admin@sistersstyle.shop</strong> / <strong>admin1234</strong>
      </div>
    </form>
  );
}

function Field({ label, type, value, onChange }) {
  return (
    <div className="mb-3.5">
      <label className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-wide text-ink-soft">
        {label}
      </label>
      <input
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line bg-cream px-3.5 py-2.5 text-[13.5px] outline-none focus:border-clay-warm"
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
