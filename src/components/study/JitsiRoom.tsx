"use client";

import { useEffect, useRef } from "react";

/**
 * Embeds the class group call. It asks the server (/api/call-token) how to
 * connect:
 *  - With JaaS configured, the server returns an 8x8.vc domain + a signed JWT,
 *    so every participant is authenticated automatically and NO ONE ever sees a
 *    Jitsi login screen.
 *  - Otherwise it returns the free public meet.jit.si (guests join via the link;
 *    only the meeting starter might be prompted).
 * If the lookup or the chosen server fails to load, it falls back to meet.jit.si
 * so the call still works.
 *
 * Whiteboard + screen sharing come built into Jitsi's toolbar either way.
 */

type JitsiApi = {
  dispose?: () => void;
  executeCommand?: (command: string, ...args: unknown[]) => void;
  addListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};
type JitsiConstructor = new (domain: string, options: Record<string, unknown>) => JitsiApi;

declare global {
  interface Window {
    JitsiMeetExternalAPI?: JitsiConstructor;
  }
}

export interface JitsiConfig {
  scriptUrl: string;
  domain: string;
  roomName: string;
  jwt: string | null;
}

const PUBLIC_FALLBACK = (roomName: string): JitsiConfig => ({
  scriptUrl: "https://meet.jit.si/external_api.js",
  domain: "meet.jit.si",
  roomName,
  jwt: null,
});

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.JitsiMeetExternalAPI) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(`script[data-jitsi="${src}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("script error")));
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.jitsi = src;
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => reject(new Error("script error")));
    document.body.appendChild(script);
  });
}

export default function JitsiRoom({
  config,
  displayName,
  onClose,
}: {
  config: JitsiConfig;
  displayName?: string;
  /** Fired when this user hangs up / leaves, so the class can return to the camera. */
  onClose?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<JitsiApi | null>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;

    function build(cfg: JitsiConfig) {
      if (cancelled || !containerRef.current || !window.JitsiMeetExternalAPI) return;
      const api = new window.JitsiMeetExternalAPI(cfg.domain, {
        roomName: cfg.roomName,
        jwt: cfg.jwt || undefined,
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
      apiRef.current = api;
      // Tile view: alone you fill the frame; as others join your tile shrinks.
      const tile = () => api.executeCommand?.("setTileView", true);
      api.addListener?.("videoConferenceJoined", tile);
      api.addListener?.("participantJoined", tile);
      api.addListener?.("readyToClose", () => onCloseRef.current?.());
      api.addListener?.("videoConferenceLeft", () => onCloseRef.current?.());
    }

    async function start() {
      try {
        await loadScript(config.scriptUrl);
        build(config);
      } catch {
        // The chosen server's script failed - fall back to the public one.
        if (cancelled) return;
        try {
          const fb = PUBLIC_FALLBACK(config.roomName);
          await loadScript(fb.scriptUrl);
          build(fb);
        } catch {
          /* give up quietly */
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      apiRef.current?.dispose?.();
      apiRef.current = null;
    };
  }, [config, displayName]);

  return <div ref={containerRef} className="h-full w-full overflow-hidden rounded-2xl bg-black/40" />;
}
