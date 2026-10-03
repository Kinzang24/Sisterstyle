"use client";

import { useEffect, useMemo, useState } from "react";
import TitleCard from "@/components/TitleCard";
import ProductCard from "@/components/ProductCard";

const TABS = [
  { id: "all", label: "All Products", icon: "▦" },
  { id: "trending", label: "Hot Trending", icon: "🔥" },
  { id: "bestseller", label: "Best Seller", icon: "👑" },
  { id: "new", label: "New Style", icon: "💎" },
];

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    let items = tab === "all" ? products : products.filter((p) => p.category === tab);
    const q = query.trim().toLowerCase();
    if (q) {
      items = items.filter(
        (p) => p.name.toLowerCase().includes(q) || (p.tags || "").toLowerCase().includes(q)
      );
    }
    return items;
  }, [products, tab, query]);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <TitleCard
          crumb="Product"
          title="Product Collection"
          subtitle={new Date().toLocaleDateString("en-US", {
            weekday: "long",
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        />
        <div className="flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2.5 shadow-sm">
          <span>🔍</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search fashion items"
            className="w-56 bg-transparent text-[13.5px] outline-none placeholder:text-ink-faint"
          />
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 rounded-full border px-4.5 py-2.5 text-[13.5px] font-bold transition ${
              tab === t.id
                ? "border-transparent bg-gradient-to-br from-clay-warm to-clay-deep text-white shadow-[0_10px_30px_-12px_rgba(156,52,56,0.18)]"
                : "border-line bg-paper text-ink-soft hover:text-ink"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <EmptyState icon="🧵" text="Loading the collection…" />
      ) : filtered.length === 0 ? (
        <EmptyState icon="🧵" text="No pieces match that search." />
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div className="py-16 text-center text-ink-soft">
      <div className="mb-2.5 text-4xl">{icon}</div>
      {text}
    </div>
  );
}
