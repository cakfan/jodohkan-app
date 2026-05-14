import { Suspense } from "react";
import { getCandidateByUsername } from "@/app/actions/candidates";
import { CvDetailModal } from "../../cv-detail-modal";
import { Spinner } from "@/components/ui/spinner";
import type { CandidateDetail } from "@/app/cv/[username]/candidate-detail-client";

interface PageProps {
  params: Promise<{ username: string }>;
}

async function ModalContent({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const result = await getCandidateByUsername(username);

  if (result.error || !result.data) {
    return null;
  }

  return (
    <CvDetailModal
      candidate={{ ...result.data, qa: result.data.qa as CandidateDetail["qa"] }}
    />
  );
}

export default function CvDetailModalPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      }
    >
      <ModalContent params={params} />
    </Suspense>
  );
}