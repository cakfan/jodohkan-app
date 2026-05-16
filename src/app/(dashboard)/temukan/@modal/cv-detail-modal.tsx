"use client";

import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  CandidateDetailClient,
  type CandidateDetail,
} from "@/app/cv/[username]/candidate-detail-client";

export function CvDetailModal({ candidate }: { candidate: CandidateDetail }) {
  const router = useRouter();

  return (
    <Dialog open onOpenChange={() => router.back()}>
      <DialogContent
        className="max-h-dvh w-full overflow-y-auto rounded-sm pt-8 sm:max-h-[90vh] sm:max-w-3xl"
        style={{ scrollbarWidth: "thin" }}
      >
        <DialogTitle className="sr-only">Detail Kandidat</DialogTitle>
        <DialogDescription className="sr-only">
          Detail profil kandidat ta&apos;aruf
        </DialogDescription>
        <CandidateDetailClient candidate={candidate} hideBackButton />
      </DialogContent>
    </Dialog>
  );
}
