import { Suspense } from "react";
import GiftComposer from "@/components/gift/GiftComposer";

export default function NewGiftPage() {
  return (
    <Suspense fallback={null}>
      <GiftComposer />
    </Suspense>
  );
}
