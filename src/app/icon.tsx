import { ImageResponse } from "next/og";
import { crescentIcon } from "@/lib/iconArt";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(crescentIcon(32), { ...size });
}
