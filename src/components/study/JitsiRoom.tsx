"use client";

import { useEffect, useRef } from "react";

/**
 * Embeds a free Jitsi Meet room (up to ~6 people comfortably) into the class.
 * Whiteboard and screen sharing come built into Jitsi's toolbar, so a "class"
 * gets group video + whiteboard + screen share with no backend of our own.
 *
 * Uses the public meet.jit.si server (free, no account). The room name is the
 * class's unique slug, so everyone who opens the same class link lands together.
 */

type JitsiApi = { dispose?: () => void };
type JitsiConstructor = new (domain: string, options: Record<string, unknown>) => JitsiApi;

declare global {
  interface Window {
    JitsiMeetExternalAPI?: JitsiConstructor;
  }
}

const JITSI_DOMAIN = "meet.jit.si";
const SCRIPT_ID = "jitsi-external-api";

export default function JitsiRoom({ room, displayName }: { room: string; displayName?: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<JitsiApi | null>(null);

  useEffect(() => {
    let cancelled = false;

    function init() {
      if (cancelled || !containerRef.current || !window.JitsiMeetExternalAPI) return;
      apiRef.current = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
        roomName: room,
        parentNode: containerRef.current,
        width: "100%",
        height: "100%",
        userInfo: displayName ? { displayName } : undefined,
        configOverwrite: {
          prejoinPageEnabled: false,
          disableDeepLinking: true,
          startWithAudioMuted: true,
          startWithVideoMuted: false,
        },
        interfaceConfigOverwrite: {
          MOBILE_APP_PROMO: false,
          SHOW_JITSI_WATERMARK: false,
          SHOW_CHROME_EXTENSION_BANNER: false,
        },
      });
    }

    function ensureScript() {
      if (window.JitsiMeetExternalAPI) {
        init();
        return;
      }
      const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener("load", init);
        return;
      }
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = `https://${JITSI_DOMAIN}/external_api.js`;
      script.async = true;
      script.addEventListener("load", init);
      document.body.appendChild(script);
    }

    ensureScript();

    return () => {
      cancelled = true;
      apiRef.current?.dispose?.();
      apiRef.current = null;
    };
  }, [room, displayName]);

  return <div ref={containerRef} className="h-full w-full overflow-hidden rounded-2xl bg-black/40" />;
}
