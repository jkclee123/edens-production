import Image from "next/image";
import logo from "@/app/crew.png";

export default function GuestLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col bg-background pt-safe">
      {/* Top Bar — mirrors AppShell header but without nav/settings */}
      <header className="relative z-[60] flex h-14 shrink-0 items-center justify-between px-4">
        {/* Spacer to match AppShell left button width */}
        <div className="h-9 w-9" aria-hidden="true" />

        {/* Center: Logo */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          <Image
            src={logo}
            alt="Eden's Production"
            width={96}
            height={96}
            priority
            className="object-contain"
          />
        </div>

        {/* Spacer to match AppShell right button width */}
        <div className="h-9 w-9" aria-hidden="true" />
      </header>

      <main className="flex-1 overflow-auto p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        {children}
      </main>
    </div>
  );
}
