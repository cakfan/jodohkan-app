import { getServerSession } from "@/lib/get-server-session";
import { redirect } from "next/navigation";
import { getNotifications } from "@/app/actions/notification";
import { NotificationsClient } from "./notifications-client";
import { getUnreadNotificationCount } from "@/app/actions/notification";

export default async function NotificationsPage() {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/signin");

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
