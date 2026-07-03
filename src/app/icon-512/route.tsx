import { ImageResponse } from "next/og";
import { crescentIcon } from "@/lib/iconArt";

export async function GET() {
  return new ImageResponse(crescentIcon(512), { width: 512, height: 512 });
}
