import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/get-server-session";
import { TaarufClient } from "./taaruf-client";

async function TaarufLoader() {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/masuk");
  return <TaarufClient />;
}

export default function TaarufPage() {
  return (
    <Suspense fallback={null}>
      <TaarufLoader />
    </Suspense>
  );
}
