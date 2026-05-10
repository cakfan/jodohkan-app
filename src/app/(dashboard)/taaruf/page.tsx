import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/get-server-session";
import { TaarufClient } from "./taaruf-client";

export default async function TaarufPage() {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/signin");
  return <TaarufClient />;
}
