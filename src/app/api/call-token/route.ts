import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Returns the video-call configuration for a class room.
 *
 * If JaaS (Jitsi-as-a-Service by 8x8) credentials are configured, we mint a
 * signed JWT so EVERY participant - host and guests alike - is authenticated
 * automatically and NOBODY is ever shown a Jitsi login screen.
 *
 * If JaaS isn't configured, we fall back to the free public meet.jit.si server
 * (guests still join via the link; only the meeting starter may be prompted).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const room = searchParams.get("room") || "";

  // Preferred: your own self-hosted Jitsi (unlimited, free, no login, no time
  // limit). Anonymous access is on by default there, so no token is needed.
  const selfHosted = process.env.JITSI_SELF_HOSTED_DOMAIN;
  if (selfHosted) {
    return NextResponse.json({
      scriptUrl: `https://${selfHosted}/external_api.js`,
      domain: selfHosted,
      roomName: room,
      jwt: null,
    });
  }

  const appId = process.env.JAAS_APP_ID;
  const kid = process.env.JAAS_KID;
  const privateKey = process.env.JAAS_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!appId || !kid || !privateKey) {
    return NextResponse.json({
      scriptUrl: "https://meet.jit.si/external_api.js",
      domain: "meet.jit.si",
      roomName: room,
      jwt: null,
    });
  }

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
      user: {
        id: user?.id || "guest",
        name,
        email: user?.email || "",
        moderator: "true",
      },
      features: {
        livestreaming: "false",
        recording: "false",
        transcription: "false",
        "outbound-call": "false",
      },
    },
  };

  const b64 = (obj: unknown) => Buffer.from(JSON.stringify(obj)).toString("base64url");
  const signingInput = `${b64(header)}.${b64(payload)}`;
  const signature = crypto.createSign("RSA-SHA256").update(signingInput).sign(privateKey).toString("base64url");
  const jwt = `${signingInput}.${signature}`;

  return NextResponse.json({
    scriptUrl: `https://8x8.vc/${appId}/external_api.js`,
    domain: "8x8.vc",
    roomName: `${appId}/${room}`,
    jwt,
  });
}
