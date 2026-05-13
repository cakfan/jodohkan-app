import { getServerSession } from "@/lib/get-server-session";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Navbar } from "@/components/layout/navbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { StreamChatProvider } from "@/components/stream-chat-provider";
import { cookies } from "next/headers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/signin");
  }

  if (!session.user.username) {
    redirect("/setup-username");
  }

  const isAdmin = session.user.role === "admin";
  const isMediator = session.user.role === "mediator";
  const skipOnboarding = isAdmin || isMediator;

  if (!skipOnboarding) {
    const existingProfile = await db.query.profile.findFirst({
      where: (profile, { eq }) => eq(profile.userId, session.user.id),
    });

    if (!existingProfile?.onboardingCompleted) {
      redirect("/onboarding");
    }
  }

  const cookieStore = await cookies();
  const sidebarCookie = cookieStore.get("sidebar_state");
  const sidebarOpen = sidebarCookie?.value === "true";

  return (
    <SidebarProvider defaultOpen={sidebarOpen}>
      <AppSidebar />
      <SidebarInset>
        <Navbar />
        <main className="flex flex-1 flex-col">
          <StreamChatProvider>
            {children}
          </StreamChatProvider>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
