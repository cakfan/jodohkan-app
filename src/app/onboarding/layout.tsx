export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none">
        <div className="bg-primary/10 absolute top-[-15%] right-[-10%] h-[60%] w-[60%] animate-pulse rounded-full opacity-60 blur-[150px]" />
        <div
          className="bg-primary/5 absolute bottom-[-15%] left-[-10%] h-[60%] w-[60%] animate-pulse rounded-full opacity-50 blur-[150px]"
          style={{ animationDelay: "3s" }}
        />
      </div>

      <main className="flex flex-1 items-start justify-center px-4 py-8 md:py-16">{children}</main>
    </div>
  );
}
