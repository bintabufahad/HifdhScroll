import { ImageResponse } from "next/og";
import { crescentIcon } from "@/lib/iconArt";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(crescentIcon(180), { ...size });
}
