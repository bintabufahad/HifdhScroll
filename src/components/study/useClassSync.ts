"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface LectureState {
  videoId: string | null;
  /** Playlist id when the lecture is a whole YouTube playlist (navigable). */
  list: string | null;
  playing: boolean;
  /** Playback position (seconds) that was true at `at`. */
  time: number;
  /** ms epoch when `time` was captured, so receivers can compute the live position. */
  at: number;
}

export const EMPTY_LECTURE: LectureState = { videoId: null, list: null, playing: false, time: 0, at: 0 };

/**
 * A persistent per-class Realtime channel (joined whenever you're in the class
 * room, not just during a call) used to keep the lecture and the whiteboard in
 * sync for everyone. Late joiners get the current lecture re-sent to them.
 */
export function useClassSync(room: string, displayName: string | undefined) {
  const [lecture, setLectureState] = useState<LectureState>(EMPTY_LECTURE);
  const lectureRef = useRef(lecture);
  useEffect(() => {
    lectureRef.current = lecture;
  }, [lecture]);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const [whiteboardBus] = useState<EventTarget>(() => new EventTarget());
  const nameRef = useRef(displayName);
  useEffect(() => {
    nameRef.current = displayName;
  }, [displayName]);

  useEffect(() => {
    const supabase = createClient();
    const myId = crypto.randomUUID();
    const channel = supabase.channel(`class:${room}`, { config: { presence: { key: myId } } });
    channelRef.current = channel;

    channel.on("broadcast", { event: "lecture" }, ({ payload }) => {
      setLectureState(payload as LectureState);
    });
    channel.on("broadcast", { event: "wb" }, ({ payload }) => {
      whiteboardBus.dispatchEvent(new CustomEvent("wb", { detail: payload }));
    });
    channel.on("presence", { event: "join" }, ({ key }) => {
      // When someone new joins, re-send the current lecture so they sync up.
      if (key === myId) return;
      const cur = lectureRef.current;
      if (cur.videoId) channel.send({ type: "broadcast", event: "lecture", payload: cur });
    });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") await channel.track({ name: nameRef.current || "Student" });
    });

    return () => {
      channelRef.current = null;
      supabase.removeChannel(channel);
    };
  }, [room, whiteboardBus]);

  const setLecture = useCallback((next: LectureState) => {
    setLectureState(next);
    lectureRef.current = next;
    channelRef.current?.send({ type: "broadcast", event: "lecture", payload: next });
  }, []);

  const sendWhiteboard = useCallback((data: unknown) => {
    channelRef.current?.send({ type: "broadcast", event: "wb", payload: data });
  }, []);

  return { lecture, setLecture, whiteboardBus, sendWhiteboard };
}
