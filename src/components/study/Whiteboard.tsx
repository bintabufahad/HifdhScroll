"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * A shared, persistent whiteboard. Live drawing is broadcast over the class
 * Realtime channel (per-segment, for smoothness); each completed stroke is also
 * saved to Supabase, so anyone who opens the board later loads everything drawn
 * so far. Normalised 0..1 coordinates keep it identical across screen sizes.
 */

const COLORS = ["#111827", "#2563eb", "#dc2626", "#059669", "#d97706"];

type Point = { x: number; y: number };
type WbMessage =
  | { wb: "stroke"; x0: number; y0: number; x1: number; y1: number; color: string }
  | { wb: "clear" };
type StoredStroke = { points: Point[]; color: string };

export default function Whiteboard({
  classId,
  bus,
  send,
  onClose,
}: {
  classId: string;
  bus: EventTarget | null;
  send: (data: unknown) => void;
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<Point | null>(null);
  const pathRef = useRef<Point[]>([]);
  const [color, setColor] = useState(COLORS[0]);
  const colorRef = useRef(color);
  useEffect(() => {
    colorRef.current = color;
  }, [color]);

  function paint(x0: number, y0: number, x1: number, y1: number, c: string) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.strokeStyle = c;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x0 * canvas.width, y0 * canvas.height);
    ctx.lineTo(x1 * canvas.width, y1 * canvas.height);
    ctx.stroke();
  }

  function drawStroke(s: StoredStroke) {
    for (let i = 1; i < s.points.length; i++) {
      paint(s.points[i - 1].x, s.points[i - 1].y, s.points[i].x, s.points[i].y, s.color);
    }
  }

  function clearBoard() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Size the canvas, then load and draw the saved history.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("whiteboard_strokes")
        .select("payload")
        .eq("class_id", classId)
        .order("created_at", { ascending: true });
      if (cancelled || !data) return;
      for (const row of data) drawStroke((row as { payload: StoredStroke }).payload);
    })();
    return () => {
      cancelled = true;
    };
    // drawStroke/paint are stable within a render; we only reload on class change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  // Live updates from other participants.
  useEffect(() => {
    if (!bus) return;
    const handler = (e: Event) => {
      const msg = (e as CustomEvent).detail as WbMessage | undefined;
      if (!msg) return;
      if (msg.wb === "stroke") paint(msg.x0, msg.y0, msg.x1, msg.y1, msg.color);
      else if (msg.wb === "clear") clearBoard();
    };
    bus.addEventListener("wb", handler);
    return () => bus.removeEventListener("wb", handler);
  }, [bus]);

  function pos(e: React.PointerEvent): Point {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height };
  }

  function onDown(e: React.PointerEvent) {
    drawing.current = true;
    const p = pos(e);
    last.current = p;
    pathRef.current = [p];
  }
  function onMove(e: React.PointerEvent) {
    if (!drawing.current || !last.current) return;
    const p = pos(e);
    const c = colorRef.current;
    paint(last.current.x, last.current.y, p.x, p.y, c);
    send({ wb: "stroke", x0: last.current.x, y0: last.current.y, x1: p.x, y1: p.y, color: c });
    last.current = p;
    pathRef.current.push(p);
  }
  async function onUp() {
    drawing.current = false;
    last.current = null;
    const points = pathRef.current;
    pathRef.current = [];
    if (points.length < 2) return;
    // Persist the completed stroke so late joiners can load it.
    const supabase = createClient();
    await supabase.from("whiteboard_strokes").insert({ class_id: classId, payload: { points, color: colorRef.current } });
  }

  async function clearAll() {
    clearBoard();
    send({ wb: "clear" });
    const supabase = createClient();
    await supabase.from("whiteboard_strokes").delete().eq("class_id", classId);
  }

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-black/70 backdrop-blur">
      <div className="flex shrink-0 items-center justify-end gap-2 px-4 py-3">
        <div className="flex items-center gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={`Colour ${c}`}
              className={`h-6 w-6 rounded-full border-2 transition ${color === c ? "border-white" : "border-white/20"}`}
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
      <div className="mx-3 mb-3 min-h-0 flex-1 overflow-hidden rounded-2xl bg-white ring-1 ring-white/10">
        <canvas
          ref={canvasRef}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
          className="h-full w-full touch-none"
        />
      </div>
    </div>
  );
}
