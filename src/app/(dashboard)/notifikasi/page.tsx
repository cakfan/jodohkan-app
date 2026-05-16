import { Suspense } from "react";
import { getServerSession } from "@/lib/get-server-session";
import { redirect } from "next/navigation";
import { getNotifications, getUnreadNotificationCount } from "@/app/actions/notification";
import { NotificationsClient } from "./notifications-client";
import { Skeleton } from "@/components/ui/skeleton";

function NotificationsSkeleton() {
  return (
    <div className="mx-auto w-full px-4 py-6">
      <Skeleton className="mb-6 h-8 w-40" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="hover:bg-muted/50 flex items-start gap-3 rounded-xl border p-4">
            <Skeleton className="mt-0.5 size-9 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="mt-1 h-3 w-full" />
              <Skeleton className="mt-1 h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <Suspense fallback={<NotificationsSkeleton />}>
      <NotificationsContent />
    </Suspense>
  );
}

async function NotificationsContent() {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/masuk");

  const [notifResult, unreadCount] = await Promise.all([
    getNotifications(),
    getUnreadNotificationCount(),
  ]);

  return (
    <NotificationsClient
      initialData={notifResult.data ?? []}
      initialUnread={unreadCount}
    />
  );
}
