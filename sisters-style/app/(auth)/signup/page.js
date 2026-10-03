"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      setBusy(false);
      setError(data.error || "Something went wrong");
      return;
    }

    const signInRes = await signIn("credentials", { email, password, redirect: false });
    setBusy(false);
    if (signInRes?.error) {
      setError("Account created — please log in.");
      router.push("/login");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="font-display mb-1 text-xl font-semibold">Create Account</h2>
      <p className="mb-5 text-[12.5px] text-ink-soft">Join to save your cart, wishlist, and track orders.</p>

      <Field label="Full name" type="text" value={name} onChange={setName} />
      <Field label="Email" type="email" value={email} onChange={setEmail} />
      <Field label="Password" type="password" value={password} onChange={setPassword} />

      {error && <p className="mb-3 text-sm font-semibold text-[#b23b34]">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-2xl bg-gradient-to-br from-clay-warm to-clay-deep py-3.5 font-extrabold text-white disabled:opacity-60"
      >
        {busy ? "Creating account…" : "Create Account"}
      </button>

      <p className="mt-4 text-center text-[12.5px] text-ink-soft">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-clay-warm">
          Log in
        </Link>
      </p>
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
