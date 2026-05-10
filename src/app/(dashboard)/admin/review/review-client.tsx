"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle,
  ExternalLink,
  MessageSquare,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CV_STATUS_LABELS } from "@/lib/constants/profile";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { reviewCv } from "@/app/actions/profile";

interface PendingProfile {
  id: string;
  userId: string;
  cvStatus: string | null;
  createdAt: Date | null;
  rejectionReason: string | null;
  name: string | null;
  username: string | null;
  email: string | null;
}



export function ReviewClient({ initialData }: { initialData: PendingProfile[] }) {
  const [profiles, setProfiles] = useState(initialData);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleReview = async (
    userId: string,
    action: "approve" | "reject"
  ) => {
    setLoadingId(userId);
    const reason =
      action === "reject"
        ? prompt("Alasan penolakan (opsional):") ?? undefined
        : undefined;

    if (action === "reject" && reason === undefined) {
      setLoadingId(null);
      return;
    }

    const result = await reviewCv(userId, action, reason);
    setLoadingId(null);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    setProfiles((prev) => prev.filter((p) => p.userId !== userId));
    toast.success(
      action === "approve"
        ? "CV berhasil disetujui!"
        : "CV berhasil ditolak."
    );
  };

  if (profiles.length === 0) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Review CV</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Tidak ada CV yang perlu direview.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Review CV</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="flex items-center justify-between gap-4 rounded-xl border p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">
                      {profile.name}
                    </span>
                    <Badge
                      variant="outline"
                      className={
                        CV_STATUS_LABELS[profile.cvStatus ?? ""]?.class ??
                        "text-muted-foreground"
                      }
                    >
                      {CV_STATUS_LABELS[profile.cvStatus ?? ""]?.label ??
                        profile.cvStatus}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    @{profile.username} &middot; {profile.email}
                  </p>
                  {profile.rejectionReason && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                      <MessageSquare className="size-3" />
                      {profile.rejectionReason}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Button variant="outline" size="sm" render={<Link href={`/cv/${profile.username}`} target="_blank" />}>
                    <ExternalLink className="size-4" />
                    Lihat
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    disabled={loadingId === profile.userId}
                    onClick={() => handleReview(profile.userId, "approve")}
                  >
                    {loadingId === profile.userId ? (
                      <Spinner className="size-4" />
                    ) : (
                      <CheckCircle className="size-4" />
                    )}
                    Setujui
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={loadingId === profile.userId}
                    onClick={() => handleReview(profile.userId, "reject")}
                  >
                    {loadingId === profile.userId ? (
                      <Spinner className="size-4" />
                    ) : (
                      <XCircle className="size-4" />
                    )}
                    Tolak
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
