"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TitleCard from "@/components/TitleCard";
import { useCart } from "@/components/CartContext";
import { useUser } from "@/components/UserContext";
import { formatPrice, SHIPPING_FEE } from "@/lib/currency";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, refresh: refreshCart } = useCart();
  const { user } = useUser();

  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [method, setMethod] = useState("cod");
  const [form, setForm] = useState({ name: "", address: "", city: "", zip: "", phone: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((d) => setStripeEnabled(d.stripeEnabled));
  }, []);

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name: user.name || "",
        address: user.addressLine || "",
        city: user.addressCity || "",
        zip: user.addressZip || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const total = subtotal + SHIPPING_FEE;

  async function handlePlaceOrder() {
    setError("");
    if (!form.name.trim() || !form.address.trim()) {
      setError("Please fill in your name and address");
      return;
    }
    setBusy(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shipTo: form, method }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }
    await refreshCart();
    router.push(data.redirectUrl);
  }

  if (cart.length === 0) {
    return (
      <div>
        <TitleCard crumb="Checkout" title="Checkout" />
        <p className="text-ink-soft">Your cart is empty — nothing to check out yet.</p>
      </div>
    );
  }

  return (
    <div>
      <TitleCard crumb="Checkout" title="Checkout" />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-line bg-paper p-6">
          <h2 className="font-display mb-1 text-lg font-semibold">Shipping Details</h2>
          <p className="mb-4 text-[12.5px] text-ink-soft">Where should we send your order?</p>

          <Field label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Field label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
          <div className="flex gap-3">
            <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
            <Field label="Postal code" value={form.zip} onChange={(v) => setForm({ ...form, zip: v })} />
          </div>
          <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />

          <h2 className="font-display mb-2 mt-6 text-lg font-semibold">Payment Method</h2>
          <div className="mb-4 flex flex-col gap-2">
            <label
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 ${
                method === "cod" ? "border-clay-warm bg-[#fdeeec]" : "border-line"
              }`}
            >
              <input type="radio" checked={method === "cod"} onChange={() => setMethod("cod")} />
              <div>
                <div className="text-sm font-bold">Cash on Delivery</div>
                <div className="text-[11.5px] text-ink-soft">Pay when your order arrives.</div>
              </div>
            </label>

            <label
              className={`flex items-center gap-3 rounded-xl border p-3.5 ${
                stripeEnabled ? "cursor-pointer" : "cursor-not-allowed opacity-50"
              } ${method === "stripe" ? "border-clay-warm bg-[#fdeeec]" : "border-line"}`}
            >
              <input
                type="radio"
                disabled={!stripeEnabled}
                checked={method === "stripe"}
                onChange={() => setMethod("stripe")}
              />
              <div>
                <div className="text-sm font-bold">Card (via Stripe)</div>
                <div className="text-[11.5px] text-ink-soft">
                  {stripeEnabled
                    ? "Redirects to a secure Stripe checkout page."
                    : "Not set up yet on this store — the owner needs to add Stripe keys."}
                </div>
              </div>
            </label>
          </div>

          {error && <p className="mb-3 text-sm font-semibold text-[#b23b34]">{error}</p>}

          <button
            onClick={handlePlaceOrder}
            disabled={busy}
            className="w-full rounded-2xl bg-gradient-to-br from-clay-warm to-clay-deep py-3.5 font-extrabold text-white shadow-[0_10px_30px_-12px_rgba(156,52,56,0.18)] disabled:opacity-60"
          >
            {busy ? "Placing order…" : method === "stripe" ? `Continue to Payment` : `Place Order — ${formatPrice(total)}`}
          </button>
        </div>

        <div className="h-fit rounded-2xl border border-line bg-paper p-5">
          <h3 className="font-display mb-3 text-sm font-bold">Order Summary</h3>
          {cart.map((i) => (
            <div key={i.productId} className="mb-1.5 flex justify-between text-[12.5px] text-ink-soft">
              <span className="truncate pr-2">{i.name} ×{i.qty}</span>
              <span className="flex-shrink-0">{formatPrice(i.price * i.qty)}</span>
            </div>
          ))}
          <div className="my-2 border-t border-line pt-2 text-[13.5px] text-ink-soft">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{formatPrice(SHIPPING_FEE)}</span>
            </div>
          </div>
          <div className="flex justify-between text-base font-extrabold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div className="mb-3.5 flex-1">
      <label className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-wide text-ink-soft">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line bg-cream px-3.5 py-2.5 text-[13.5px] outline-none focus:border-clay-warm"
      />
    </div>
  );
}
