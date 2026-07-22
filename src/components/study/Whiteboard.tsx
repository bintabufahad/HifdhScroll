"use client";

import { useEffect, useRef, useState } from "react";
import type { DailyCall, DailyEventObjectAppMessage } from "@daily-co/daily-js";

/**
 * A shared whiteboard for everyone in the class call. Strokes are broadcast over
 * the Daily data channel (app-messages), using normalised 0..1 coordinates so
 * every participant sees the same drawing regardless of their screen size.
 * (Late joiners see strokes drawn from when they opened it - there's no history
 * replay, which keeps it simple and backend-free.)
 */

const COLORS = ["#10b981", "#f4efe3", "#e3b341", "#ef4444", "#60a5fa"];

type WbMessage =
  | { wb: "stroke"; x0: number; y0: number; x1: number; y1: number; color: string }
  | { wb: "clear" };

export default function Whiteboard({ call, onClose }: { call: DailyCall | null; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [color, setColor] = useState(COLORS[0]);
  const colorRef = useRef(color);
  useEffect(() => {
    colorRef.current = color;
  }, [color]);

  function ctxOf(): CanvasRenderingContext2D | null {
    return canvasRef.current?.getContext("2d") ?? null;
  }

  function paint(x0: number, y0: number, x1: number, y1: number, c: string) {
    const canvas = canvasRef.current;
    const ctx = ctxOf();
    if (!canvas || !ctx) return;
    ctx.strokeStyle = c;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x0 * canvas.width, y0 * canvas.height);
    ctx.lineTo(x1 * canvas.width, y1 * canvas.height);
    ctx.stroke();
  }

  function clearBoard() {
    const canvas = canvasRef.current;
    const ctx = ctxOf();
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Keep the canvas backing store sized to its display box.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Receive strokes from other participants.
  useEffect(() => {
    if (!call) return;
    const handler = (ev: DailyEventObjectAppMessage | undefined) => {
      const msg = ev?.data as WbMessage | undefined;
      if (!msg) return;
      if (msg.wb === "stroke") paint(msg.x0, msg.y0, msg.x1, msg.y1, msg.color);
      else if (msg.wb === "clear") clearBoard();
    };
    call.on("app-message", handler);
    return () => {
      call.off("app-message", handler);
    };
    // paint/clearBoard are stable within a render; re-subscribing per render is unwanted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [call]);

  function pos(e: React.PointerEvent): { x: number; y: number } {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height };
  }

  function onDown(e: React.PointerEvent) {
    drawing.current = true;
    last.current = pos(e);
  }
  function onMove(e: React.PointerEvent) {
    if (!drawing.current || !last.current) return;
    const p = pos(e);
    const c = colorRef.current;
    paint(last.current.x, last.current.y, p.x, p.y, c);
    call?.sendAppMessage({ wb: "stroke", x0: last.current.x, y0: last.current.y, x1: p.x, y1: p.y, color: c }, "*");
    last.current = p;
  }
  function onUp() {
    drawing.current = false;
    last.current = null;
  }

  function clearAll() {
    clearBoard();
    call?.sendAppMessage({ wb: "clear" }, "*");
  }

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-black/70 backdrop-blur">
      <div className="flex shrink-0 items-center justify-between gap-2 px-4 py-3">
        <span className="font-display text-sm font-semibold text-emerald-300">Shared whiteboard</span>
        <div className="flex items-center gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={`Colour ${c}`}
              className={`h-6 w-6 rounded-full border-2 transition ${color === c ? "border-white" : "border-transparent"}`}
              style={{ backgroundColor: c }}
            />
          ))}
          <button
            type="button"
            onClick={clearAll}
            className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-emerald-950 hover:bg-emerald-400"
          >
            Done
          </button>
        </div>
      </div>
      <div className="mx-3 mb-3 min-h-0 flex-1 overflow-hidden rounded-2xl bg-[#0c1512] ring-1 ring-white/10">
        <canvas
          ref={canvasRef}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
          className="h-full w-full touch-none"
        />
      </div>
      {!call && (
        <p className="pb-3 text-center text-xs text-white/50">
          Start or join the group call to draw together in real time.
        </p>
      )}
    </div>
  );
}
