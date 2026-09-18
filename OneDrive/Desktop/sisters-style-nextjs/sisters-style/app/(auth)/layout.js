import Image from "next/image";

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mx-auto mb-6 w-48 rounded-2xl bg-white p-3 shadow-lg">
          <Image src="/logo.png" alt="Sister'Style" width={280} height={190} className="h-auto w-full" priority />
        </div>
        <div className="rounded-2xl border border-line bg-paper p-7 shadow-[0_10px_30px_-12px_rgba(156,52,56,0.18)]">
          {children}
        </div>
      </div>
    </div>
  );
}
