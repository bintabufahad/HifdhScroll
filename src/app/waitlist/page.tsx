import { Suspense } from "react";
import WaitlistForm from "@/components/WaitlistForm";

export default function WaitlistPage() {
  return (
    <div className="paper-texture flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-[#efe4c8] via-[#e8dcc0] to-[#ddcda3] px-6 py-12">
      <Suspense fallback={null}>
        <WaitlistForm />
      </Suspense>
    </div>
  );
}
