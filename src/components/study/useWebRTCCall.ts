"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface CallTile {
  id: string;
  name: string;
  local: boolean;
  stream: MediaStream | null;
}

// Free STUN (Google) + a free public TURN relay for when direct P2P is blocked
// by strict/mobile NATs. No account or card required.
const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  {
    urls: [
      "turn:openrelay.metered.ca:80",
      "turn:openrelay.metered.ca:443",
      "turn:openrelay.metered.ca:443?transport=tcp",
    ],
    username: "openrelayproject",
    credential: "openrelayproject",
  },
];

interface SignalPayload {
  from: string;
  to: string;
  kind: "offer" | "answer" | "ice";
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

/**
 * A serverless mesh video call: everyone in a class joins a Supabase Realtime
 * channel (free) used only to swap WebRTC signalling. Media then flows peer-to-
 * peer, so there's no video service, no account, no card, no cap. Good for small
 * groups (the class use case). Pass room=null to stay disconnected.
 */
export function useWebRTCCall(room: string | null, displayName: string | undefined, onError: (msg: string) => void) {
  const [tiles, setTiles] = useState<CallTile[]>([]);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  const myIdRef = useRef<string>("");
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamsRef = useRef<Map<string, MediaStream>>(new Map());
  const namesRef = useRef<Map<string, string>>(new Map());
  const channelRef = useRef<RealtimeChannel | null>(null);

  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);
  const nameRef = useRef(displayName);
  useEffect(() => {
    nameRef.current = displayName;
  }, [displayName]);

  const rebuildTiles = useCallback(() => {
    const list: CallTile[] = [
      { id: myIdRef.current, name: nameRef.current || "You", local: true, stream: localStreamRef.current },
    ];
    for (const [id, stream] of remoteStreamsRef.current) {
      list.push({ id, name: namesRef.current.get(id) || "Guest", local: false, stream });
    }
    setTiles(list);
  }, []);

  useEffect(() => {
    if (!room) return;
    let cancelled = false;
    const supabase = createClient();
    const myId = crypto.randomUUID();
    myIdRef.current = myId;

    const peers = new Map<string, RTCPeerConnection>();
    const pendingIce = new Map<string, RTCIceCandidateInit[]>();
    const remoteStreams = remoteStreamsRef.current;
    const names = namesRef.current;

    function sendSignal(payload: SignalPayload) {
      channelRef.current?.send({ type: "broadcast", event: "signal", payload });
    }

    function makePeer(otherId: string, initiator: boolean): RTCPeerConnection {
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      peers.set(otherId, pc);
      localStreamRef.current?.getTracks().forEach((t) => pc.addTrack(t, localStreamRef.current!));

      pc.onicecandidate = (e) => {
        if (e.candidate) sendSignal({ from: myId, to: otherId, kind: "ice", candidate: e.candidate.toJSON() });
      };
      pc.ontrack = (e) => {
        let s = remoteStreams.get(otherId);
        if (!s) {
          s = new MediaStream();
          remoteStreams.set(otherId, s);
        }
        if (!s.getTracks().includes(e.track)) s.addTrack(e.track);
        rebuildTiles();
      };
      if (initiator) {
        pc.onnegotiationneeded = async () => {
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            sendSignal({ from: myId, to: otherId, kind: "offer", sdp: offer });
          } catch {
            /* ignore */
          }
        };
      }
      return pc;
    }

    async function flushIce(otherId: string, pc: RTCPeerConnection) {
      const pending = pendingIce.get(otherId);
      if (!pending) return;
      for (const c of pending) {
        try {
          await pc.addIceCandidate(c);
        } catch {
          /* ignore */
        }
      }
      pendingIce.delete(otherId);
    }

    async function handleSignal(payload: SignalPayload) {
      if (payload.to !== myId) return;
      const otherId = payload.from;
      let pc = peers.get(otherId);

      if (payload.kind === "offer") {
        if (!pc) pc = makePeer(otherId, false);
        await pc.setRemoteDescription(payload.sdp!);
        await flushIce(otherId, pc);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendSignal({ from: myId, to: otherId, kind: "answer", sdp: answer });
      } else if (payload.kind === "answer") {
        if (pc) {
          await pc.setRemoteDescription(payload.sdp!);
          await flushIce(otherId, pc);
        }
      } else if (payload.kind === "ice" && payload.candidate) {
        if (pc?.remoteDescription) {
          try {
            await pc.addIceCandidate(payload.candidate);
          } catch {
            /* ignore */
          }
        } else {
          const arr = pendingIce.get(otherId) ?? [];
          arr.push(payload.candidate);
          pendingIce.set(otherId, arr);
        }
      }
    }

    (async () => {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 360 }, frameRate: { ideal: 24 } },
          audio: true,
        });
      } catch {
        onErrorRef.current("Allow camera & microphone access to join the call.");
        return;
      }
      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      localStreamRef.current = stream;
      setMicOn(true);
      setCamOn(true);
      rebuildTiles();

      const channel = supabase.channel(`call:${room}`, { config: { presence: { key: myId } } });
      channelRef.current = channel;

      channel.on("broadcast", { event: "signal" }, ({ payload }) => handleSignal(payload as SignalPayload));
      channel.on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<{ name?: string }>();
        const ids = Object.keys(state);
        for (const id of ids) {
          const meta = state[id]?.[0];
          if (meta?.name) names.set(id, meta.name);
        }
        // I initiate to peers with a "larger" id so exactly one side offers.
        for (const id of ids) {
          if (id === myId || peers.has(id)) continue;
          if (myId < id) makePeer(id, true);
        }
        // Drop peers who have left.
        for (const id of Array.from(peers.keys())) {
          if (!ids.includes(id)) {
            peers.get(id)?.close();
            peers.delete(id);
            remoteStreams.delete(id);
            names.delete(id);
            pendingIce.delete(id);
          }
        }
        rebuildTiles();
      });

      channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") await channel.track({ name: nameRef.current || "Student" });
      });
    })();

    return () => {
      cancelled = true;
      peers.forEach((pc) => pc.close());
      peers.clear();
      remoteStreams.clear();
      names.clear();
      pendingIce.clear();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      const ch = channelRef.current;
      channelRef.current = null;
      if (ch) supabase.removeChannel(ch);
      setTiles([]);
    };
  }, [room, rebuildTiles]);

  const toggleMic = useCallback(() => {
    const s = localStreamRef.current;
    if (!s) return;
    const on = !(s.getAudioTracks()[0]?.enabled ?? false);
    s.getAudioTracks().forEach((t) => (t.enabled = on));
    setMicOn(on);
  }, []);

  const toggleCam = useCallback(() => {
    const s = localStreamRef.current;
    if (!s) return;
    const on = !(s.getVideoTracks()[0]?.enabled ?? false);
    s.getVideoTracks().forEach((t) => (t.enabled = on));
    setCamOn(on);
  }, []);

  return { tiles, micOn, camOn, toggleMic, toggleCam };
}
