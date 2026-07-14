import { Suspense } from "react";
import FeedbackForm from "@/components/FeedbackForm";

export default function FeedbackPage() {
  return (
    <div className="bg-app-dark flex flex-1 flex-col items-center justify-center px-6 py-12">
      <Suspense fallback={null}>
        <FeedbackForm />
      </Suspense>
    </div>
  );
}
