"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import TitleCard from "@/components/TitleCard";
import { useUser } from "@/components/UserContext";
import { useCart } from "@/components/CartContext";

function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-xl">
      {msg}
    </div>
  );
}

function Toggle({ on, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative h-6 w-[42px] flex-shrink-0 rounded-full transition ${on ? "bg-sage" : "bg-ink-faint"}`}
    >
      <span
        className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow transition-transform ${
          on ? "translate-x-[21px]" : "translate-x-[3px]"
        }`}
      />
    </button>
  );
}

function Card({ title, children, danger }) {
  return (
    <div className={`mb-4 rounded-2xl border bg-paper p-6 ${danger ? "border-[#f0d3ce]" : "border-line"}`}>
      <h2 className={`font-display mb-1 text-lg font-semibold ${danger ? "text-[#b23b34]" : ""}`}>{title}</h2>
      {children}
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

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading, updateUser, refresh } = useUser();
  const { removeFromCart, cart } = useCart();
  const fileRef = useRef(null);

  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [addr, setAddr] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [toast, setToast] = useState("");
  const [hydrated, setHydrated] = useState(false);

  if (user && !hydrated) {
    setName(user.name || "");
    setEmail(user.email || "");
    setPhone(user.phone || "");
    setAddr(user.addressLine || "");
    setCity(user.addressCity || "");
    setZip(user.addressZip || "");
    setHydrated(true);
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2400);
  }

  async function handleAvatarFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image too large — please use one under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (res.ok) {
      setAvatarUrl(data.url);
    } else {
      showToast(data.error || "Upload failed");
    }
  }

  async function saveAvatar() {
    const url = avatarUrl || avatarPreview;
    if (!url) {
      showToast("Choose a photo first");
      return;
    }
    await updateUser({ avatar: url });
    showToast("Photo updated");
  }
  async function removeAvatar() {
    await updateUser({ avatar: "" });
    setAvatarPreview("");
    setAvatarUrl("");
    showToast("Photo removed");
  }

  async function savePersonalInfo() {
    if (!name.trim() || !email.trim()) {
      showToast("Name and email are required");
      return;
    }
    const { ok, data } = await updateUser({ name, email, phone });
    showToast(ok ? "Profile updated" : data.error || "Failed to update");
  }

  async function saveAddress() {
    const { ok, data } = await updateUser({ addressLine: addr, addressCity: city, addressZip: zip });
    showToast(ok ? "Address saved" : data.error || "Failed to save");
  }

  async function toggleSetting(key) {
    await updateUser({ [key]: !user[key] });
  }

  async function changePassword() {
    if (newPassword.length < 4) {
      showToast("Password must be at least 4 characters");
      return;
    }
    const { ok, data } = await updateUser({ newPassword });
    setNewPassword("");
    showToast(ok ? "Password updated" : data.error || "Failed to update");
  }

  async function clearMyData() {
    if (!confirm("Clear your cart and wishlist?")) return;
    for (const item of cart) await removeFromCart(item.productId);
    showToast("Cart cleared");
  }

  async function deleteAccount() {
    if (!confirm("Delete your account permanently? This cannot be undone.")) return;
    await fetch("/api/account", { method: "DELETE" });
    await signOut({ callbackUrl: "/" });
  }

  if (loading || !user) return <p className="text-ink-soft">Loading…</p>;

  const currentAvatar = avatarPreview || user.avatar;

  return (
    <div className="max-w-xl">
      <TitleCard crumb="Settings" title="Settings" />

      <Card title="Profile Photo">
        <p className="mb-3 text-[12.5px] text-ink-soft">Shown on your account and order history.</p>
        <div className="mb-3 flex items-center gap-3 rounded-xl border border-dashed border-ink-faint bg-cream p-3.5">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#eee] to-[#ddd]">
            {currentAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={currentAvatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-xl">{user.name?.charAt(0)?.toUpperCase()}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <label className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-wide text-ink-soft">
              Upload a new photo
            </label>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarFile} className="text-[11.5px]" />
          </div>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={saveAvatar}
            className="rounded-2xl bg-gradient-to-br from-clay-warm to-clay-deep px-5 py-2.5 text-sm font-extrabold text-white"
          >
            Save Photo
          </button>
          {user.avatar && (
            <button
              onClick={removeAvatar}
              className="rounded-2xl border border-line px-5 py-2.5 text-sm font-bold text-ink-soft"
            >
              Remove
            </button>
          )}
        </div>
      </Card>

      <Card title="Personal Info">
        <Field label="Full name" value={name} onChange={setName} />
        <Field label="Email" type="email" value={email} onChange={setEmail} />
        <Field label="Phone" value={phone} onChange={setPhone} placeholder="+975 17 123 456" />
        <button
          onClick={savePersonalInfo}
          className="rounded-2xl bg-gradient-to-br from-clay-warm to-clay-deep px-5 py-2.5 text-sm font-extrabold text-white"
        >
          Save Changes
        </button>
      </Card>

      <Card title="Default Shipping Address">
        <p className="mb-3 text-[12.5px] text-ink-soft">Used to pre-fill checkout.</p>
        <Field label="Address" value={addr} onChange={setAddr} placeholder="123 Thread Lane" />
        <div className="flex gap-3">
          <Field label="City" value={city} onChange={setCity} placeholder="Thimphu" />
          <Field label="Postal code" value={zip} onChange={setZip} placeholder="11001" />
        </div>
        <button
          onClick={saveAddress}
          className="rounded-2xl bg-gradient-to-br from-clay-warm to-clay-deep px-5 py-2.5 text-sm font-extrabold text-white"
        >
          Save Address
        </button>
      </Card>

      <Card title="Notifications">
        <SettingsRow
          label="Order updates"
          desc="Emails when your order ships or is delivered"
          on={user.emailUpdates}
          onClick={() => toggleSetting("emailUpdates")}
        />
        <SettingsRow
          label="Newsletter"
          desc="New arrivals and style edits, roughly monthly"
          on={user.newsletter}
          onClick={() => toggleSetting("newsletter")}
        />
        <SettingsRow
          label="SMS delivery alerts"
          desc="Text message when your order is out for delivery"
          on={user.smsAlerts}
          onClick={() => toggleSetting("smsAlerts")}
          last
        />
      </Card>

      <Card title="Change Password">
        <Field label="New password" type="password" value={newPassword} onChange={setNewPassword} />
        <button
          onClick={changePassword}
          className="rounded-2xl bg-gradient-to-br from-clay-warm to-clay-deep px-5 py-2.5 text-sm font-extrabold text-white"
        >
          Update Password
        </button>
      </Card>

      <Card title="Danger Zone" danger>
        <SettingsRow
          label="Clear my cart & wishlist"
          desc="Empties your saved items on this account"
          action={
            <button onClick={clearMyData} className="rounded-full border border-line px-4 py-2 text-xs font-bold text-ink-soft">
              Clear
            </button>
          }
        />
        <SettingsRow
          label="Delete account"
          desc="Permanently removes this account. Can't be undone."
          last
          action={
            <button onClick={deleteAccount} className="rounded-full bg-[#b23b34] px-4 py-2 text-xs font-bold text-white">
              Delete
            </button>
          }
        />
      </Card>

      <Toast msg={toast} />
    </div>
  );
}

function SettingsRow({ label, desc, on, onClick, action, last }) {
  return (
    <div className={`flex items-center justify-between gap-3.5 py-3.5 ${last ? "" : "border-b border-line"}`}>
      <div>
        <div className="text-[13.5px] font-bold">{label}</div>
        <div className="mt-0.5 text-[11.5px] text-ink-soft">{desc}</div>
      </div>
      {action || <Toggle on={on} onClick={onClick} />}
    </div>
  );
}
