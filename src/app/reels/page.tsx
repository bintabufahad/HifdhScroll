import SetupForm from "@/components/SetupForm";

export default function ReelsSetupPage() {
  return (
    <div className="bg-app-dark flex flex-1 flex-col px-4 py-4 sm:px-6 sm:py-6">
      <div className="animate-rise-in">
        <SetupForm />
      </div>
    </div>
  );
}
