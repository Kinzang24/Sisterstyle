"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TitleCard from "@/components/TitleCard";
import ProductFormModal from "@/components/ProductFormModal";
import { formatPrice } from "@/lib/currency";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = closed, {} = new, product = edit
  const [tab, setTab] = useState("products");

  function load() {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => {
        setProducts(d);
        setLoading(false);
      });
  }
  useEffect(load, []);

  function handleSaved(product) {
    setEditing(null);
    load();
  }

  async function handleDelete(id, name) {
    if (!confirm(`Delete "${name}"? This can't be undone.`)) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <TitleCard crumb="Admin" title="Admin Panel" />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold">Manage Collection</h2>
          <p className="text-[12.5px] text-ink-soft">
            {products.length} item{products.length !== 1 ? "s" : ""} in the catalog
          </p>
        </div>
        <div className="flex gap-2.5">
          <Link href="/" className="rounded-full border border-line bg-paper px-4 py-2.5 text-sm font-bold text-ink-soft">
            ← Back to Shop
          </Link>
          <button
            onClick={() => setEditing({})}
            className="rounded-full bg-gradient-to-br from-clay-warm to-clay-deep px-4 py-2.5 text-sm font-extrabold text-white"
          >
            + Add Product
          </button>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <TabButton active={tab === "products"} onClick={() => setTab("products")}>
          Products
        </TabButton>
        <Link href="/admin/orders">
          <TabButton active={false}>Orders</TabButton>
        </Link>
      </div>

      {loading ? (
        <p className="text-ink-soft">Loading…</p>
      ) : products.length === 0 ? (
        <div className="py-16 text-center text-ink-soft">
          <div className="mb-2.5 text-4xl">🧵</div>
          No products yet. Add your first piece.
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {products.map((p) => (
            <div key={p.id} className="flex items-center gap-3.5 rounded-2xl border border-line bg-paper p-3">
              <div className="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-cream">
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xl">👕</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-display truncate text-sm font-semibold">{p.name}</h4>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-ink-soft">
                  <span className="rounded-full bg-[#fdeeec] px-2 py-0.5 font-extrabold uppercase text-clay-deep">
                    {p.category}
                  </span>
                  <span>{formatPrice(p.price)}</span>
                  <span className="truncate">{p.tags}</span>
                </div>
              </div>
              <div className="flex flex-shrink-0 gap-1.5">
                <button
                  onClick={() => setEditing(p)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-cream text-clay-deep"
                  title="Edit"
                >
                  ✎
                </button>
                <button
                  onClick={() => handleDelete(p.id, p.name)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-cream text-[#b23b34]"
                  title="Delete"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing !== null && (
        <ProductFormModal
          product={editing.id ? editing : null}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-[12.5px] font-bold ${
        active ? "border-transparent bg-ink text-white" : "border-line bg-paper text-ink-soft"
      }`}
    >
      {children}
    </button>
  );
}
