"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * When a magic-link sign-in fails, Supabase sends the user back to the site
 * (often the home page) with error details in the URL query and/or hash - e.g.
 * ?error=access_denied&error_code=otp_expired. Instead of leaving them on a
 * page with cryptic URL junk, show a clear banner and a way to try again, then
 * clean the URL.
 */
export default function AuthErrorNotice() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fromQuery = new URLSearchParams(window.location.search);
    const fromHash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const code = fromQuery.get("error_code") || fromHash.get("error_code");
    const err = fromQuery.get("error") || fromHash.get("error");
    if (!code && !err) return;

    const msg =
      code === "otp_expired"
        ? "That sign-in link had already expired or been used. Please request a new one and open it right away."
        : "That sign-in link didn't work. Please request a new one.";

    // Deferred so it isn't a synchronous setState in the effect body (and so the
    // first render matches the server's empty output - no hydration mismatch).
    const t = setTimeout(() => setMessage(msg), 0);
    // Clean the error params out of the URL so a refresh doesn't re-show it.
    window.history.replaceState({}, "", window.location.pathname);
    return () => clearTimeout(t);
  }, []);

  if (!message) return null;

  return (
    <div className="mx-auto mb-6 w-full max-w-2xl rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-center text-sm text-amber-100">
      {message}{" "}
      <Link href="/waitlist" className="font-semibold text-amber-200 underline underline-offset-2 hover:text-white">
        Request a new link
      </Link>
    </div>
  );
}
