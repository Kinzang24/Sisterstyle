import { formatPrice } from "@/lib/currency";

const STATUS_STYLE = {
  pending_payment: "bg-[#fde8d8] text-[#a35c0c]",
  processing: "bg-[#fef3d8] text-[#a3760c]",
  on_delivery: "bg-[#e0ecfb] text-[#2a5f9e]",
  delivered: "bg-[#e3f2e6] text-[#5f8f6a]",
  cancelled: "bg-[#f3dede] text-[#a33c3c]",
};

const STEPS = ["processing", "on_delivery", "delivered"];
const STEP_LABELS = ["Placed", "Out for Delivery", "Delivered"];

export default function OrderCard({ order, adminControls }) {
  const stepIdx = STEPS.indexOf(order.status);

  return (
    <div className="mb-3 rounded-2xl border border-line bg-paper p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="font-display font-bold">{order.id}</span>{" "}
          <span className="text-[11px] text-ink-soft">
            — {new Date(order.created_at).toLocaleDateString()}
          </span>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-wide ${
            STATUS_STYLE[order.status] || "bg-cream text-ink-soft"
          }`}
        >
          {order.status.replace("_", " ")}
        </span>
      </div>

      {order.buyerName && (
        <div className="mb-1.5 text-[12px] text-ink-soft">
          {order.buyerName} · {order.buyerEmail}
        </div>
      )}

      <div className="mb-2.5 text-[12px] text-ink-soft">
        {order.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}
      </div>

      {order.status !== "cancelled" && order.status !== "pending_payment" && (
        <div className="mb-3 flex items-center">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="relative flex-1 text-center">
              {i > 0 && (
                <div
                  className={`absolute left-[-50%] top-[10px] h-0.5 w-full ${
                    i <= stepIdx ? "bg-sage" : "bg-line"
                  }`}
                />
              )}
              <div
                className={`relative z-10 mx-auto mb-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-extrabold text-white ${
                  i < stepIdx ? "bg-sage" : i === stepIdx ? "bg-clay-warm" : "bg-line"
                }`}
              >
                {i < stepIdx ? "✓" : i + 1}
              </div>
              <div className="text-[9.5px] uppercase tracking-wide text-ink-soft">{label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="font-extrabold">{formatPrice(order.total)}</div>
        {adminControls}
      </div>
    </div>
  );
}
