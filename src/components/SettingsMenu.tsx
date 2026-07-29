"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Lang, StringKey } from "@/lib/i18n";

/**
 * The ⚙ settings button (top-left of the home hub): shows the signed-in email,
 * log out, and the English/Arabic language switch.
 */
export default function SettingsMenu({
  t,
  lang,
  onSwitchLang,
}: {
  t: (key: StringKey) => string;
  lang: Lang;
  onSwitchLang: (lang: Lang) => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Fetch the signed-in email once the menu is first opened (cheap + lazy).
  useEffect(() => {
    if (!open || email !== null) return;
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!cancelled) setEmail(user?.email ?? "");
    })();
    return () => {
      cancelled = true;
    };
  }, [open, email]);

  // Close when tapping anywhere outside the panel.
  useEffect(() => {
    if (!open) return;
    function onDown(e: PointerEvent) {
      if (!panelRef.current?.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [open]);

  async function logout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/waitlist");
    router.refresh();
  }

  return (
    <div ref={panelRef} className="fixed left-3 top-3 z-50 sm:left-4 sm:top-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("settings")}
        className={`lift glass-strong flex h-10 w-10 items-center justify-center rounded-full text-lg shadow-md transition sm:h-11 sm:w-11 ${
          open ? "text-white" : "text-emerald-200 hover:text-white"
        }`}
      >
        ⚙
      </button>

      {open && (
        <div className="animate-rise-in absolute left-0 top-12 w-64 rounded-xl border border-white/12 bg-[#0c1512] p-3 shadow-2xl sm:top-[3.25rem]">
          <div className="mb-3 border-b border-white/10 pb-3">
            <p className="text-[10px] font-medium uppercase tracking-widest text-emerald-200/70">{t("signedInAs")}</p>
            <p className="mt-1 truncate text-sm text-white" title={email ?? undefined}>
              {email === null ? "…" : email === "" ? t("notSignedIn") : email}
            </p>
          </div>

          <div className="mb-3">
            <p className="mb-1.5 text-[10px] font-medium uppercase tracking-widest text-emerald-200/70">
              {t("language")}
            </p>
            <div className="flex gap-1.5">
              {(
                [
                  { value: "en", label: "English" },
                  { value: "ar", label: "العربية" },
                ] as { value: Lang; label: string }[]
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onSwitchLang(opt.value)}
                  className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition ${
                    lang === opt.value
                      ? "bg-emerald-500 text-emerald-950"
                      : "border border-white/15 bg-white/5 text-white/70 hover:bg-white/10"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {email !== "" && (
            <button
              type="button"
              onClick={logout}
              disabled={loggingOut}
              className="w-full rounded-lg border border-red-400/25 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-200 transition hover:bg-red-500/20 disabled:opacity-60"
            >
              {loggingOut ? "…" : t("logout")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
