import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Returns the video-call configuration for a class room. Priority:
 *   1. Daily.co (free, no credit card, no login for anyone) - if DAILY_API_KEY
 *      is set we ensure the room exists and return its URL.
 *   2. Self-hosted Jitsi (JITSI_SELF_HOSTED_DOMAIN) - unlimited, no login.
 *   3. JaaS (8x8) - signed JWT so nobody sees a login.
 *   4. Public meet.jit.si - demo only (5-min limit); last-resort fallback.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const room = searchParams.get("room") || "";

  // 1. Daily.co
  const dailyKey = process.env.DAILY_API_KEY;
  const dailyDomain = process.env.DAILY_DOMAIN?.replace(/^https?:\/\//, "").replace(/\.daily\.co.*$/, "");
  if (dailyKey && dailyDomain) {
    const ready = await ensureDailyRoom(dailyKey, room);
    if (ready) {
      return NextResponse.json({ provider: "daily", url: `https://${dailyDomain}.daily.co/${room}` });
    }
    // If room creation genuinely failed (e.g. bad key), fall through to Jitsi.
  }

  // 2. Self-hosted Jitsi
  const selfHosted = process.env.JITSI_SELF_HOSTED_DOMAIN;
  if (selfHosted) {
    return NextResponse.json({
      provider: "jitsi",
      scriptUrl: `https://${selfHosted}/external_api.js`,
      domain: selfHosted,
      roomName: room,
      jwt: null,
    });
  }

  // 3. JaaS
  const appId = process.env.JAAS_APP_ID;
  const kid = process.env.JAAS_KID;
  const privateKey = process.env.JAAS_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (appId && kid && privateKey) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const name = (user?.user_metadata?.name as string | undefined) || user?.email?.split("@")[0] || "Student";

    const now = Math.floor(Date.now() / 1000);
    const header = { alg: "RS256", kid, typ: "JWT" };
    const payload = {
      aud: "jitsi",
      iss: "chat",
      sub: appId,
      room: "*",
      iat: now,
      nbf: now - 10,
      exp: now + 3 * 60 * 60,
      context: {
        user: { id: user?.id || "guest", name, email: user?.email || "", moderator: "true" },
        features: { livestreaming: "false", recording: "false", transcription: "false", "outbound-call": "false" },
      },
    };
    const b64 = (obj: unknown) => Buffer.from(JSON.stringify(obj)).toString("base64url");
    const signingInput = `${b64(header)}.${b64(payload)}`;
    const signature = crypto.createSign("RSA-SHA256").update(signingInput).sign(privateKey).toString("base64url");
    return NextResponse.json({
      provider: "jitsi",
      scriptUrl: `https://8x8.vc/${appId}/external_api.js`,
      domain: "8x8.vc",
      roomName: `${appId}/${room}`,
      jwt: `${signingInput}.${signature}`,
    });
  }

  // 4. Public fallback
  return NextResponse.json({
    provider: "jitsi",
    scriptUrl: "https://meet.jit.si/external_api.js",
    domain: "meet.jit.si",
    roomName: room,
    jwt: null,
  });
}

/** Create the Daily room if it doesn't exist yet. Returns true if it's usable. */
async function ensureDailyRoom(apiKey: string, room: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        name: room,
        privacy: "public",
        properties: {
          enable_screenshare: true,
          enable_chat: true,
          start_audio_off: true,
          start_video_off: false,
        },
      }),
    });
    // 200 = created; 400/409 with "already exists" = fine to use.
    if (res.ok) return true;
    if (res.status === 400 || res.status === 409) {
      const body = await res.text();
      return body.includes("already") || body.includes("exists");
    }
    return false;
  } catch {
    return false;
  }
}
