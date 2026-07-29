"use client";

import { useEffect, useRef, useState } from "react";

export interface CameraController {
  stream: MediaStream | null;
  cameraOn: boolean;
  /** An i18n StringKey ("" when no error) - translate at display time. */
  error: string;
  recording: boolean;
  recordingUrl: string | null;
  toggleCamera: () => Promise<void>;
  startRecording: () => void;
  stopRecording: () => void;
}

/**
 * Owns the camera stream and recording state at the dashboard level, so the
 * self-view can be rendered in the big "lecture" slot or the small sidebar slot
 * (and move between them) without the stream being torn down. The presentational
 * CameraView just attaches whatever stream this exposes to its own <video>.
 */
export function useCamera(): CameraController {
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const urlRef = useRef<string | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [error, setError] = useState("");
  const [recording, setRecording] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  function stopRecording() {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setRecording(false);
  }

  async function toggleCamera() {
    if (cameraOn) {
      if (recording) stopRecording();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setStream(null);
      setCameraOn(false);
      return;
    }

    setError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("browserNoCamera");
      return;
    }
    try {
      // Request a modest resolution/framerate. A full-res self-view decodes
      // alongside the YouTube lecture, and on phones/tablets that contention is
      // what makes the lecture stutter and "buffer" even on a good connection.
      const s = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 360 }, frameRate: { ideal: 24 } },
        audio: true,
      });
      streamRef.current = s;
      setStream(s);
      setCameraOn(true);
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError") {
        setError("cameraBlocked");
      } else if (name === "NotFoundError") {
        setError("noCameraFound");
      } else {
        setError("cameraFailed");
      }
    }
  }

  function startRecording() {
    if (!streamRef.current || typeof MediaRecorder === "undefined") {
      setError("recordingUnsupported");
      return;
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
      setRecordingUrl(null);
    }
    chunksRef.current = [];
    try {
      const recorder = new MediaRecorder(streamRef.current);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: chunksRef.current[0]?.type || "video/webm" });
        const url = URL.createObjectURL(blob);
        urlRef.current = url;
        setRecordingUrl(url);
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
    } catch {
      setError("recordingFailed");
    }
  }

  return { stream, cameraOn, error, recording, recordingUrl, toggleCamera, startRecording, stopRecording };
}
