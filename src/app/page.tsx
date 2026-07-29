import { Suspense } from "react";
import AuthErrorNotice from "@/components/AuthErrorNotice";
import HomeHub from "@/components/HomeHub";

export default function Home() {
  return (
    <>
      <Suspense fallback={null}>
        <AuthErrorNotice />
      </Suspense>
      <HomeHub />
    </>
  );
}
