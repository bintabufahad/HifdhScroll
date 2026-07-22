"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DailyCall, DailyParticipant } from "@daily-co/daily-js";

export interface CallTile {
  sessionId: string;
  userName: string;
  local: boolean;
  videoTrack: MediaStreamTrack | null;
  audioTrack: MediaStreamTrack | null;
  screenTrack: MediaStreamTrack | null;
}

function toTile(p: DailyParticipant, fallbackName: string): CallTile {
  const v = p.tracks.video;
  const a = p.tracks.audio;
  const s = p.tracks.screenVideo;
  return {
    sessionId: p.session_id,
    userName: p.user_name || (p.local ? fallbackName : "Guest"),
    local: p.local,
    videoTrack: v?.state === "playable" ? v.persistentTrack ?? null : null,
    audioTrack: a?.state === "playable" ? a.persistentTrack ?? null : null,
    screenTrack: s?.state === "playable" ? s.persistentTrack ?? null : null,
  };
}

/**
 * Joins a Daily room in "call object" mode - we own the media tracks and render
 * our own tiles (so we control the exact layout) and get a data channel for the
 * shared whiteboard. Pass url=null to stay disconnected.
 */
export function useDailyCall(url: string | null, displayName: string | undefined, onLeft: () => void) {
  const callRef = useRef<DailyCall | null>(null);
  const [callObject, setCallObject] = useState<DailyCall | null>(null);
  const [tiles, setTiles] = useState<CallTile[]>([]);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [sharing, setSharing] = useState(false);

  const onLeftRef = useRef(onLeft);
  useEffect(() => {
    onLeftRef.current = onLeft;
  }, [onLeft]);
  const nameRef = useRef(displayName);
  useEffect(() => {
    nameRef.current = displayName;
  }, [displayName]);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    let call: DailyCall | null = null;

    (async () => {
      const DailyIframe = (await import("@daily-co/daily-js")).default;
      if (cancelled) return;
      call = DailyIframe.createCallObject();
      callRef.current = call;
      setCallObject(call);

      const sync = () => {
        if (!call) return;
        const ps = call.participants();
        const fallback = nameRef.current || "You";
        setTiles(Object.values(ps).map((p) => toTile(p, fallback)));
        const local = ps.local;
        if (local) {
          setMicOn(!!local.audio);
          setCamOn(!!local.video);
          const st = local.tracks.screenVideo?.state;
          setSharing(st === "playable" || st === "sendable" || st === "loading");
        }
      };

      call
        .on("joined-meeting", sync)
        .on("participant-joined", sync)
        .on("participant-updated", sync)
        .on("participant-left", sync)
        .on("track-started", sync)
        .on("track-stopped", sync)
        .on("left-meeting", () => onLeftRef.current());

      try {
        await call.join({ url, userName: nameRef.current });
        sync();
      } catch {
        onLeftRef.current();
      }
    })();

    return () => {
      cancelled = true;
      const c = callRef.current;
      callRef.current = null;
      setCallObject(null);
      c?.leave().catch(() => {});
      c?.destroy();
    };
  }, [url]);

  const toggleMic = useCallback(() => {
    const c = callRef.current;
    if (!c) return;
    const on = !c.localAudio();
    c.setLocalAudio(on);
    setMicOn(on);
  }, []);

  const toggleCam = useCallback(() => {
    const c = callRef.current;
    if (!c) return;
    const on = !c.localVideo();
    c.setLocalVideo(on);
    setCamOn(on);
  }, []);

  const toggleShare = useCallback(() => {
    const c = callRef.current;
    if (!c) return;
    if (sharing) {
      c.stopScreenShare();
      setSharing(false);
    } else {
      c.startScreenShare();
      setSharing(true);
    }
  }, [sharing]);

  const leave = useCallback(() => {
    callRef.current?.leave().catch(() => {});
  }, []);

  return { callObject, tiles, micOn, camOn, sharing, toggleMic, toggleCam, toggleShare, leave };
}
