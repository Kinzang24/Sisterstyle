"use client";

import { useState } from "react";

const CATEGORIES = [
  { value: "trending", label: "Hot Trending" },
  { value: "bestseller", label: "Best Seller" },
  { value: "new", label: "New Style" },
];

export default function ProductFormModal({ product, onClose, onSaved }) {
  const editing = Boolean(product);
  const [name, setName] = useState(product?.name || "");
  const [tags, setTags] = useState(product?.tags || "");
  const [price, setPrice] = useState(product?.price ?? "");
  const [category, setCategory] = useState(product?.category || "trending");
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || "");
  const [preview, setPreview] = useState(product?.imageUrl || "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Image too large — please use one under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (res.ok) {
      setImageUrl(data.url);
      setError("");
    } else {
      setError(data.error || "Upload failed");
    }
  }

  async function handleSave() {
    setError("");
    const priceNum = parseFloat(price);
    if (!name.trim()) return setError("Please enter a product name");
    if (isNaN(priceNum) || priceNum < 0) return setError("Please enter a valid price");

    setBusy(true);
    const payload = { name, tags, price: priceNum, category, imageUrl };
    const res = await fetch(editing ? `/api/products/${product.id}` : "/api/products", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setError(data.error || "Failed to save");
    onSaved(data);
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-5">
      <div className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-[22px] bg-paper p-7">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">{editing ? "Edit Product" : "Add Product"}</h2>
          <button onClick={onClose} className="text-xl text-ink-soft">
            ✕
          </button>
        </div>
        <p className="mb-5 text-[12.5px] text-ink-soft">
          {editing ? "Update the details below." : "Fill in the details for the new piece."}
        </p>

        <div className="mb-3 flex items-center gap-3 rounded-xl border border-dashed border-ink-faint bg-cream p-3.5">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#eee] to-[#ddd]">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl">👕</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <label className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-wide text-ink-soft">
              Product photo
            </label>
            <input type="file" accept="image/*" onChange={handleFile} className="text-[11.5px]" />
          </div>
        </div>

        <Field label="Or paste an image URL" value={imageUrl.startsWith("data:") ? "" : imageUrl} onChange={(v) => { setImageUrl(v); setPreview(v); }} placeholder="https://..." />
        <Field label="Product name" value={name} onChange={setName} placeholder="e.g. Cloudy Linen Shirt" />
        <Field label="Tags" value={tags} onChange={setTags} placeholder="#Shirt #Unisex" />

        <div className="flex gap-3">
          <Field label="Price (Nu.)" type="number" value={price} onChange={setPrice} placeholder="1500" />
          <div className="mb-3.5 flex-1">
            <label className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-wide text-ink-soft">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-line bg-cream px-3.5 py-2.5 text-[13.5px] outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="mb-3 text-sm font-semibold text-[#b23b34]">{error}</p>}

        <button
          onClick={handleSave}
          disabled={busy}
          className="w-full rounded-2xl bg-gradient-to-br from-clay-warm to-clay-deep py-3.5 font-extrabold text-white disabled:opacity-60"
        >
          {busy ? "Saving…" : editing ? "Save Changes" : "Add Product"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, type = "text", value, onChange, placeholder }) {
  return (
    <div className="mb-3.5">
      <label className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-wide text-ink-soft">
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line bg-cream px-3.5 py-2.5 text-[13.5px] outline-none focus:border-clay-warm"
      />
    </div>
  );
}
