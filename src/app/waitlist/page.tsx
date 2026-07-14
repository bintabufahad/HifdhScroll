import { Suspense } from "react";
import WaitlistForm from "@/components/WaitlistForm";

export default function WaitlistPage() {
  return (
    <div className="bg-app-dark flex flex-1 flex-col items-center justify-center px-6 py-12">
      <Suspense fallback={null}>
        <WaitlistForm />
      </Suspense>
    </div>
  );
}
