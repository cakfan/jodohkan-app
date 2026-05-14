"use client";

import { useEffect, useState, useCallback, useMemo, Component } from "react";
import Link from "next/link";
import type { StreamChat } from "stream-chat";
import { useTheme } from "next-themes";
import { useChatContext, useChannelStateContext, WithComponents } from "stream-chat-react";
import {
  Chat,
  Channel,
  ChannelList,
  MessageList,
  MessageComposer,
  Avatar as StreamAvatar,
} from "stream-chat-react";
import {
  Shield,
  Users,
  Trash2,
  X,
  Ban,
  OctagonXIcon,
  Crown,
  Lock,
  Clock,
  ScrollText,
  FileText,
  Pin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useStreamChat } from "@/components/stream-chat-provider";
import {
  deleteTaarufChannel,
  banTaarufUser,
  unbanTaarufUser,
  freezeTaarufChannel,
  getChannelOwner,
  unpinMessage,
} from "@/app/actions/stream";
import { checkMessageContent } from "@/lib/adab-guard";
import {
  freezeForAdab,
  checkAdabFreeze,
  getViolationsForChannel,
  submitAppeal,
  reviewAppeal,
} from "@/app/actions/adab-guard";
import type { ViolationWithUser } from "@/app/actions/adab-guard";
import "stream-chat-react/dist/css/index.css";
import "./chat-theme.css";

const defaultSort = { last_updated: -1 as const };
const options = { state: true, watch: true, limit: 100 };

function EmptyChannels() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="text-muted-foreground/40 mb-3 text-4xl">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <h3 className="mb-1 text-sm font-medium">Belum ada percakapan ta&apos;aruf</h3>
      <p className="text-muted-foreground mb-3 text-xs">
        Terima permintaan ta&apos;aruf untuk memulai chat.
      </p>
      <Link href="/taaruf" className="text-primary text-xs font-medium hover:underline">
        Lihat Permintaan Ta&apos;aruf
      </Link>
    </div>
  );
}

function ChannelListError() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="text-muted-foreground/40 mb-3 text-4xl">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <h3 className="mb-1 text-sm font-medium">Belum ada percakapan ta&apos;aruf</h3>
      <p className="text-muted-foreground mb-3 text-xs">
        Terima permintaan ta&apos;aruf untuk memulai chat.
      </p>
      <Link href="/taaruf" className="text-primary text-xs font-medium hover:underline">
        Lihat Permintaan Ta&apos;aruf
      </Link>
    </div>
  );
}

function NoChannelSelected() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="text-muted-foreground/40 mb-4 text-5xl">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <h3 className="mb-1 font-medium">Pilih percakapan</h3>
      <p className="text-muted-foreground max-w-xs text-sm">
        Pilih percakapan dari daftar di samping untuk mulai mengirim pesan.
      </p>
    </div>
  );
}

function MemberPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { channel, client } = useChatContext();
  const [banning, setBanning] = useState<string | null>(null);
  const [freezing, setFreezing] = useState(false);
  const [bannedUserIds, setBannedUserIds] = useState<Set<string>>(new Set());
  const [pendingAction, setPendingAction] = useState<{
    type: "ban" | "unban";
    userId: string;
    userName: string;
  } | null>(null);
  const [freezeDialogOpen, setFreezeDialogOpen] = useState(false);
  const isFrozen = channel?.data?.frozen === true;

  useEffect(() => {
    if (!channel?.id || !client) return;
    client
      .queryBannedUsers({ channel_cid: channel.cid })
      .then((response) => {
        setBannedUserIds(new Set((response.bans ?? []).map((b) => b.user.id)));
      })
      .catch(() => {});
  }, [channel?.id, channel?.cid, client]);

  const members = channel?.state?.members ? Object.values(channel.state.members) : [];
  const localOwnerId = channel?.data?.created_by_id ?? channel?.data?.created_by?.id;
  const [serverOwnerId, setServerOwnerId] = useState<string | undefined>();
  const ownerId = serverOwnerId ?? localOwnerId;

  useEffect(() => {
    if (!channel?.id || localOwnerId) return;
    let cancelled = false;
    getChannelOwner(channel.id).then((r) => {
      if (!cancelled && "ownerId" in r && r.ownerId) setServerOwnerId(r.ownerId);
    });
    return () => {
      cancelled = true;
    };
  }, [channel?.id, localOwnerId]);

  const owner = members.find(
    (m: { channel_role?: string; user?: { id?: string } }) =>
      m.channel_role === "owner" || m.user?.id === ownerId
  );
  const isMediator = owner?.user?.id === client?.userID;

  const executeAction = async () => {
    if (!pendingAction || !channel?.id) return;
    const { type, userId, userName } = pendingAction;
    setBanning(userId);
    const result =
      type === "ban"
        ? await banTaarufUser(channel.id, userId)
        : await unbanTaarufUser(channel.id, userId);
    if (result.success) {
      if (type === "ban") {
        setBannedUserIds((prev) => new Set(prev).add(userId));
        toast.success(`${userName} berhasil diblokir`);
      } else {
        setBannedUserIds((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
        toast.success(`${userName} berhasil dibuka blokirnya`);
      }
    } else {
      toast.error(result.error!);
    }
    setBanning(null);
    setPendingAction(null);
  };

  const [freezeReason, setFreezeReason] = useState("");

  const handleFreeze = async () => {
    if (!channel?.id) return;
    setFreezing(true);
    const result = await freezeTaarufChannel(
      channel.id,
      !isFrozen,
      isFrozen ? undefined : freezeReason
    );
    if (result.success) {
      toast.success(isFrozen ? "Ta'aruf dibuka kembali" : "Ta'aruf diakhiri");
      if (!isFrozen) {
        window.location.href = "/messages";
      }
    } else {
      toast.error(result.error!);
    }
    setFreezing(false);
    setFreezeDialogOpen(false);
    setFreezeReason("");
  };

  if (!open) return null;

  return (
    <>
      <AlertDialog
        open={pendingAction !== null}
        onOpenChange={(open) => {
          if (!open) setPendingAction(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              {pendingAction?.type === "ban" ? (
                <OctagonXIcon className="text-destructive size-8" />
              ) : (
                <Ban className="size-8 text-green-600" />
              )}
            </AlertDialogMedia>
            <AlertDialogTitle>
              {pendingAction?.type === "ban" ? "Blokir Peserta" : "Buka Blokir Peserta"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.type === "ban"
                ? `Apakah Anda yakin ingin memblokir ${pendingAction?.userName} dari channel ini?`
                : `Apakah Anda yakin ingin membuka blokir ${pendingAction?.userName}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              variant={pendingAction?.type === "ban" ? "destructive" : "default"}
              onClick={executeAction}
            >
              {pendingAction?.type === "ban" ? "Ya, blokir" : "Ya, buka blokir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={freezeDialogOpen} onOpenChange={setFreezeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <Shield className="text-primary size-8" />
            </AlertDialogMedia>
            <AlertDialogTitle>{isFrozen ? "Buka Ta'aruf" : "Akhiri Ta'aruf"}</AlertDialogTitle>
            <AlertDialogDescription>
              {isFrozen
                ? "Ta'aruf akan dibuka kembali. Peserta dapat mengirim pesan lagi."
                : "Ta'aruf akan ditutup. Peserta tidak dapat mengirim pesan lagi."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {!isFrozen && (
            <div className="px-6 pb-4">
              <Textarea
                placeholder="Alasan mengakhiri ta'aruf..."
                value={freezeReason}
                onChange={(e) => setFreezeReason(e.target.value)}
                rows={3}
              />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setFreezeDialogOpen(false);
                setFreezeReason("");
              }}
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              variant={isFrozen ? "default" : "destructive"}
              onClick={handleFreeze}
              disabled={freezing}
            >
              {freezing ? "Memproses..." : isFrozen ? "Ya, buka" : "Ya, akhiri"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="bg-background flex w-80 shrink-0 flex-col border-l">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Info Grup</h3>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="text-muted-foreground/50"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-3">
            <p className="text-muted-foreground/60 mb-2 text-[10px] font-medium uppercase">
              {members.length} peserta
            </p>
            <div className="space-y-1">
              {members.map((m) => {
                const isOwner = m.channel_role === "owner" || m.user?.id === ownerId;
                const isBanned = bannedUserIds.has(m.user?.id ?? "");
                const isMe = m.user?.id === client?.userID;
                const isOtherParticipant = !isOwner && !isMe;

                return (
                  <div
                    key={m.user?.id}
                    className="hover:bg-muted flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 transition-colors"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-medium">
                        {(m.user?.name ?? "?")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-sm">
                            {m.user?.name ?? m.user?.id}
                            {isMe ? " (Anda)" : ""}
                          </span>
                          {isBanned && <Ban className="text-destructive size-3 shrink-0" />}
                        </div>
                        <div className="flex items-center gap-1">
                          {isOwner && (
                            <span className="bg-primary/10 text-primary inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[9px] font-medium">
                              <Crown className="size-2.5" />
                              Owner
                            </span>
                          )}
                          {isBanned && (
                            <span className="text-destructive text-[9px] font-medium">
                              Diblokir
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isMediator && isOtherParticipant && (
                      <Button
                        variant="ghost"
                        onClick={() =>
                          setPendingAction({
                            type: isBanned ? "unban" : "ban",
                            userId: m.user!.id,
                            userName: m.user?.name ?? m.user!.id,
                          })
                        }
                        disabled={banning === m.user?.id}
                        className={`shrink-0 text-[10px] ${
                          isBanned
                            ? "text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30"
                            : "text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
                        }`}
                      >
                        {banning === m.user?.id ? "..." : isBanned ? "Buka blokir" : "Blokir"}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {isMediator && (
          <div className="border-t px-4 py-3">
            <Button
              variant={isFrozen ? "outline" : "destructive"}
              size="sm"
              onClick={() => setFreezeDialogOpen(true)}
              disabled={freezing}
              className="w-full"
            >
              <Shield className="size-3.5" />
              {isFrozen ? "Buka Ta'aruf" : "Akhiri Ta'aruf"}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

function ActivityLogPanel({
  open,
  onClose,
  channelId,
  clientUserId,
  isMediator,
  onReviewComplete,
}: {
  open: boolean;
  onClose: () => void;
  channelId: string;
  clientUserId: string;
  isMediator: boolean;
  onReviewComplete?: () => void;
}) {
  const [violations, setViolations] = useState<ViolationWithUser[] | null>(null);
  const [appealDialog, setAppealDialog] = useState<ViolationWithUser | null>(null);
  const [appealText, setAppealText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewDialog, setReviewDialog] = useState<ViolationWithUser | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  useEffect(() => {
    if (!open || !channelId) return;
    let cancelled = false;
    getViolationsForChannel(channelId).then((res) => {
      if (cancelled) return;
      if ("violations" in res) setViolations(res.violations ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [open, channelId]);

  const handleAppeal = async () => {
    if (!appealDialog || !appealText.trim()) return;
    setSubmitting(true);
    const res = await submitAppeal(appealDialog.id, appealText);
    if ("error" in res) {
      toast.error(res.error);
    } else {
      toast.success("Banding berhasil dikirim");
      setViolations((prev) =>
        prev!.map((v) =>
          v.id === appealDialog.id
            ? {
                ...v,
                status: "appealed",
                appealReason: appealText,
                appealedAt: new Date().toISOString(),
              }
            : v
        )
      );
      setAppealDialog(null);
      setAppealText("");
    }
    setSubmitting(false);
  };

  const handleReview = async (action: "overturn" | "uphold") => {
    if (!reviewDialog) return;
    setSubmitting(true);
    const res = await reviewAppeal({
      violationId: reviewDialog.id,
      action,
      notes: reviewNotes,
    });
    if ("error" in res) {
      toast.error(res.error);
    } else {
      toast.success(action === "overturn" ? "Banding diterima" : "Banding ditolak");
      setViolations((prev) =>
        prev!.map((v) =>
          v.id === reviewDialog.id
            ? {
                ...v,
                status: action === "overturn" ? "overturned" : "upheld",
                reviewNotes,
                reviewedAt: new Date().toISOString(),
              }
            : v
        )
      );
      if (action === "overturn") onReviewComplete?.();
      setReviewDialog(null);
      setReviewNotes("");
    }
    setSubmitting(false);
  };

  const statusBadge: Record<
    string,
    { label: string; variant: "destructive" | "secondary" | "outline"; classes: string }
  > = {
    frozen: { label: "Dibekukan", variant: "destructive", classes: "" },
    appealed: {
      label: "Dibanding",
      variant: "outline",
      classes: "border-amber-300 text-amber-600 dark:border-amber-700 dark:text-amber-400",
    },
    overturned: {
      label: "Diterima",
      variant: "outline",
      classes: "border-emerald-300 text-emerald-600 dark:border-emerald-700 dark:text-emerald-400",
    },
    upheld: { label: "Ditolak", variant: "secondary", classes: "" },
  };

  if (!open) return null;

  return (
    <>
      <AlertDialog
        open={appealDialog !== null}
        onOpenChange={(o) => {
          if (!o) setAppealDialog(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <Lock className="text-destructive size-8" />
            </AlertDialogMedia>
            <AlertDialogTitle>Ajukan Banding</AlertDialogTitle>
            <AlertDialogDescription>
              Jelaskan alasan Anda mengapa ini bukan pelanggaran. Banding akan direview oleh
              mediator.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="px-6 pb-4">
            <Textarea
              placeholder="Alasan banding..."
              value={appealText}
              onChange={(e) => setAppealText(e.target.value)}
              rows={4}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setAppealDialog(null);
                setAppealText("");
              }}
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleAppeal} disabled={submitting || !appealText.trim()}>
              {submitting ? "Mengirim..." : "Kirim Banding"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={reviewDialog !== null}
        onOpenChange={(o) => {
          if (!o) setReviewDialog(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <Shield className="text-primary size-8" />
            </AlertDialogMedia>
            <AlertDialogTitle>Review Banding</AlertDialogTitle>
            <AlertDialogDescription>
              {reviewDialog && (
                <div className="mt-2 space-y-2 text-left text-sm">
                  <p>
                    <span className="font-medium">Pelanggaran:</span> {reviewDialog.reason}
                  </p>
                  {reviewDialog.messageText && (
                    <p>
                      <span className="font-medium">Pesan:</span> &ldquo;{reviewDialog.messageText}
                      &rdquo;
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Alasan banding:</span> {reviewDialog.appealReason}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="px-6 pb-4">
            <label className="text-muted-foreground mb-1 block text-xs font-medium">
              Catatan review
            </label>
            <Textarea
              placeholder="Catatan untuk keputusan..."
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows={3}
            />
          </div>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              onClick={() => {
                setReviewDialog(null);
                setReviewNotes("");
              }}
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              variant="outline"
              onClick={() => handleReview("overturn")}
              disabled={submitting}
            >
              {submitting ? "..." : "Terima Banding"}
            </AlertDialogAction>
            <AlertDialogAction
              variant="destructive"
              onClick={() => handleReview("uphold")}
              disabled={submitting}
            >
              {submitting ? "..." : "Tolak Banding"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex min-h-0 w-80 shrink-0 flex-col border-l">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Aktivitas</h3>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="text-muted-foreground/50"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {violations === null ? (
            <div className="space-y-2 p-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-3/4" />
            </div>
          ) : violations.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
              <FileText className="text-muted-foreground/20 mb-2 size-8" />
              <p className="text-muted-foreground text-xs">Belum ada aktivitas pelanggaran</p>
            </div>
          ) : (
            <div className="space-y-2 p-3">
              {violations.map((v) => {
                const sb = statusBadge[v.status] ?? statusBadge.frozen;
                const isOwn = v.userId === clientUserId;
                return (
                  <Card key={v.id} className="p-3">
                    <div className="mb-1.5 flex items-center gap-2">
                      <Badge
                        variant={sb.variant as "destructive" | "secondary" | "outline"}
                        className={sb.classes}
                      >
                        {sb.label}
                      </Badge>
                      <span className="text-muted-foreground text-[10px]">
                        {new Date(v.createdAt ?? "").toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="mb-0.5 text-xs leading-relaxed">{v.reason}</p>
                    {v.messageText && (
                      <p className="text-muted-foreground mb-2 truncate italic">
                        &ldquo;{v.messageText}&rdquo;
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      {v.status === "frozen" && isOwn && (
                        <Button variant="outline" onClick={() => setAppealDialog(v)}>
                          Ajukan Banding
                        </Button>
                      )}
                      {v.status === "appealed" && isOwn && (
                        <Badge
                          variant="outline"
                          className="border-amber-300 text-[10px] text-amber-600 dark:border-amber-700 dark:text-amber-400"
                        >
                          Menunggu review mediator
                        </Badge>
                      )}
                      {v.status === "appealed" && isMediator && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setReviewDialog(v);
                            setReviewNotes("");
                          }}
                        >
                          Review
                        </Button>
                      )}
                      {v.status === "overturned" && (
                        <Badge
                          variant="outline"
                          className="border-emerald-300 text-[10px] text-emerald-600 dark:border-emerald-700 dark:text-emerald-400"
                        >
                          Banding diterima
                        </Badge>
                      )}
                      {v.status === "upheld" && (
                        <Badge variant="secondary" className="text-[10px]">
                          Banding ditolak
                        </Badge>
                      )}
                    </div>
                    {v.reviewNotes && (v.status === "overturned" || v.status === "upheld") && (
                      <p className="text-muted-foreground mt-1.5 border-t pt-1.5 text-[10px] leading-relaxed italic">
                        {v.reviewNotes}
                      </p>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function ChannelHeaderGroup({
  onMemberPanelToggle,
  onActivityToggle,
}: {
  onMemberPanelToggle: () => void;
  onActivityToggle: () => void;
}) {
  const { channel, client } = useChatContext();
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const members = channel?.state?.members ? Object.values(channel.state.members) : [];
  const ownerId = channel?.data?.created_by_id ?? channel?.data?.created_by?.id;
  const owner = members.find(
    (m: { channel_role?: string; user?: { id?: string } }) =>
      m.channel_role === "owner" || m.user?.id === ownerId
  );
  const isMediator = owner?.user?.id === client?.userID;

  const handleDelete = useCallback(async () => {
    if (!channel?.id) return;
    setDeleting(true);
    const result = await deleteTaarufChannel(channel.id);
    if (result.error) {
      toast.error(result.error);
      setDeleting(false);
    } else {
      window.location.href = "/messages";
    }
  }, [channel]);

  return (
    <>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <Trash2 className="text-destructive size-8" />
            </AlertDialogMedia>
            <AlertDialogTitle>Hapus Channel</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus channel ini? Semua pesan akan hilang permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>Batal</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Menghapus..." : "Ya, hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="bg-card flex items-center gap-3 border-b px-4 py-3">
        <Button
          variant="ghost"
          onClick={onMemberPanelToggle}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-none px-0 text-left hover:bg-transparent dark:hover:bg-transparent"
        >
          <div className="bg-primary/10 flex size-10 shrink-0 items-center justify-center rounded-full">
            <Users className="text-primary size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-semibold">{channel?.data?.name ?? "Ta'aruf"}</h2>
            <p className="text-muted-foreground truncate text-xs">
              {members.length} peserta
              {owner ? ` · ${owner.user?.name ?? "Owner"}` : ""}
            </p>
          </div>
        </Button>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onActivityToggle}
            title="Aktivitas Ta'aruf"
          >
            <ScrollText className="size-3.5" />
          </Button>
          {isMediator && (
            <Button
              variant="destructive"
              size="icon-sm"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={deleting}
              title="Hapus channel"
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

function PinnedMessageBanner() {
  const { channel, client } = useChatContext();
  const { pinnedMessages } = useChannelStateContext();
  const [unpinning, setUnpinning] = useState(false);

  const pinned = useMemo(() => {
    if (pinnedMessages && pinnedMessages.length > 0) {
      const latest = pinnedMessages[0];
      return {
        id: latest.id,
        text: latest.text ?? "",
        userName: (latest.user?.name ?? latest.user?.id) || "Unknown",
      };
    }
    return null;
  }, [pinnedMessages]);

  const handleUnpin = async () => {
    if (!channel?.id || !pinned?.id) return;
    setUnpinning(true);
    await unpinMessage(channel.id, pinned.id);
    setUnpinning(false);
  };

  if (!pinned) return null;

  const isMediator = (() => {
    const members = channel?.state?.members ? Object.values(channel.state.members) : [];
    const ownerId = channel?.data?.created_by_id ?? channel?.data?.created_by?.id;
    const owner = members.find(
      (m: { channel_role?: string; user?: { id?: string } }) =>
        m.channel_role === "owner" || m.user?.id === ownerId
    );
    return owner?.user?.id === client?.userID;
  })();

  return (
    <div className="bg-muted/30 border-muted flex items-center gap-2 border-b px-4 py-1.5 text-xs">
      <Pin className="text-muted-foreground size-3 shrink-0" />
      <span className="text-muted-foreground min-w-0 flex-1 truncate">
        <span className="font-medium">{pinned.userName}</span>: {pinned.text}
      </span>
      {isMediator && (
        <button
          onClick={handleUnpin}
          disabled={unpinning}
          className="text-muted-foreground hover:text-foreground shrink-0 transition-colors"
          title="Lepas pin"
        >
          <X className="size-3" />
        </button>
      )}
    </div>
  );
}

function ChannelContent() {
  const { channel, client } = useChatContext();
  const { messages } = useChannelStateContext();
  const [memberPanelOpen, setMemberPanelOpen] = useState(false);
  const [activityPanelOpen, setActivityPanelOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const isFrozen = channel?.data?.frozen === true;
  const hasMessages = messages && messages.length > 0;

  const cd = channel?.data as Record<string, unknown> | undefined;
  const adabFreezeExpiresAt = (cd?.adab_freeze_expires_at as string | undefined) ?? null;
  const adabFreezeReason = (cd?.adab_freeze_reason as string | undefined) ?? null;
  const adabFreezePermanent = cd?.adab_freeze_permanent === true;

  const [localFreeze, setLocalFreeze] = useState<{
    expiresAt: string | null;
    permanent: boolean;
    reason: string;
  } | null>(null);

  const effectiveReason = adabFreezeReason ?? localFreeze?.reason ?? null;
  const effectiveExpiresAt = adabFreezeExpiresAt ?? localFreeze?.expiresAt ?? null;

  const isAdabFrozenTemporal =
    (adabFreezeExpiresAt !== null && now < new Date(adabFreezeExpiresAt).getTime()) ||
    (localFreeze?.expiresAt !== null &&
      localFreeze?.expiresAt !== undefined &&
      now < new Date(localFreeze.expiresAt).getTime());
  const isAdabFrozenPermanent =
    (isFrozen && adabFreezePermanent) || localFreeze?.permanent === true;
  const isAdabFrozen = isAdabFrozenTemporal || isAdabFrozenPermanent;
  const isMediatorFrozen = isFrozen && !adabFreezeReason && !localFreeze;

  const members = channel?.state?.members ? Object.values(channel.state.members) : [];
  const ownerId = channel?.data?.created_by_id ?? channel?.data?.created_by?.id;
  const owner = members.find(
    (m: { channel_role?: string; user?: { id?: string } }) =>
      m.channel_role === "owner" || m.user?.id === ownerId
  );
  const isMediator = owner?.user?.id === client?.userID;

  useEffect(() => {
    const cid = channel?.id;
    if (!cid || !adabFreezeExpiresAt) return;
    const expiresAtMs = new Date(adabFreezeExpiresAt).getTime();

    const id = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= expiresAtMs) {
        checkAdabFreeze(cid);
        clearInterval(id);
      }
    }, 1_000);
    return () => clearInterval(id);
  }, [channel?.id, adabFreezeExpiresAt]);

  function useAllowedMessageActions() {
    const { client, channel } = useChatContext();

    const currentUserId = client?.userID;
    const members = channel?.state?.members ?? {};
    const currentMember = currentUserId ? members[currentUserId] : undefined;

    const isOwner =
      currentMember?.channel_role === "owner" || currentMember?.channel_role === "admin";

    if (isOwner) {
      return ["delete", "pin", "edit", "flag", "react", "reply", "quote"];
    }

    return ["react", "quote", "flag"];
  }

  const messageActions = useAllowedMessageActions();

  const handleSendMessage = useCallback(
    async (params: { message: { text?: string } }) => {
      const text = params.message.text ?? "";
      const result = checkMessageContent(text);

      if (!result.passed && channel?.id && client?.userID) {
        const res = await freezeForAdab({
          channelId: channel.id,
          userId: client.userID,
          messageText: text,
          reason: result.reason ?? "",
          violationCategory: result.violationCategory ?? "bad_word",
        });

        if ("error" in res) {
          toast.error(res.error);
          return;
        }

        if ("permanent" in res && res.permanent) {
          setLocalFreeze({
            expiresAt: null,
            permanent: true,
            reason: result.reason ?? "",
          });
        } else if ("expiresAt" in res && res.expiresAt) {
          setLocalFreeze({
            expiresAt: res.expiresAt,
            permanent: false,
            reason: result.reason ?? "",
          });
        }
        return;
      }

      if (channel) {
        await channel.sendMessage({ text });
      }
    },
    [channel, client]
  );

  function formatRemaining(expiresAt: string): string {
    if (now === 0) return "";
    const remaining = new Date(expiresAt).getTime() - now;
    if (remaining <= 0) return "0 detik";
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const mins = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    const secs = Math.floor((remaining % (60 * 1000)) / 1000);
    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours}j`);
    if (mins > 0) parts.push(`${mins}m`);
    parts.push(`${secs}d`);
    return parts.join(" ");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ChannelHeaderGroup
        onMemberPanelToggle={() => setMemberPanelOpen((v) => !v)}
        onActivityToggle={() => setActivityPanelOpen((v) => !v)}
      />
      <div className="flex min-h-0 flex-1">
        <div className="flex min-h-0 flex-1 flex-col">
          {isMediatorFrozen && (
            <div className="border-primary bg-primary/10 text-primary border-l-4 px-4 py-3 text-xs">
              <div className="flex items-start gap-2">
                <Shield className="mt-0.5 size-4 shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">
                    Ta&apos;aruf telah selesai. Tidak dapat mengirim pesan lagi.
                  </span>
                  {channel?.data?.freeze_reason && (
                    <span className="text-primary/70">{channel.data.freeze_reason as string}</span>
                  )}
                </div>
              </div>
            </div>
          )}
          {isAdabFrozenTemporal && (
            <div className="border-destructive bg-destructive/5 border-l-4 px-4 py-3 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <div className="bg-destructive/20 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full">
                  <Lock className="text-destructive size-3.5" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-destructive text-xs font-semibold">
                    Chat dibekukan karena pelanggaran adab
                  </span>
                  {effectiveReason && (
                    <span className="text-destructive/80 text-xs">{effectiveReason}</span>
                  )}
                  <span className="text-destructive/80 flex items-center gap-1 text-xs">
                    <Clock className="size-3" />
                    Aktif kembali dalam {formatRemaining(effectiveExpiresAt!)}
                  </span>
                </div>
              </div>
            </div>
          )}
          {isAdabFrozenPermanent && (
            <div className="border-destructive bg-destructive/1 border-l-4 px-4 py-3 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <div className="bg-destructive/20 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full">
                  <Lock className="text-destructive size-3.5" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-destructive text-xs font-semibold">
                    Ta&apos;aruf diakhiri karena 3 kali pelanggaran adab
                  </span>
                  {effectiveReason && (
                    <span className="text-destructive/75 text-xs">{effectiveReason}</span>
                  )}
                  <span className="text-destructive/60 flex items-center gap-1 text-xs">
                    <Lock className="size-3" />
                    Chat tidak dapat digunakan lagi
                  </span>
                </div>
              </div>
            </div>
          )}
          <PinnedMessageBanner />
          <div className="grid min-h-0 flex-1 grid-rows-[1fr_auto] overflow-x-hidden">
            <div className="min-h-0 overflow-x-hidden">
              {hasMessages ? (
                <MessageList messageActions={messageActions} disableDateSeparator={false} />
              ) : (
                <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                  <div className="text-muted-foreground/40 mb-4 text-5xl">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      <line x1="12" y1="8" x2="12" y2="16" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                  </div>
                  <h3 className="mb-1 font-medium">Belum ada pesan</h3>
                  <p className="text-muted-foreground max-w-xs text-sm">
                    Kirim pesan pertama untuk memulai percakapan ta&apos;aruf.
                  </p>
                </div>
              )}
            </div>
            {!isMediatorFrozen && !isAdabFrozen && (
              <MessageComposer overrideSubmitHandler={handleSendMessage} />
            )}
          </div>
        </div>
        <ActivityLogPanel
          open={activityPanelOpen}
          onClose={() => setActivityPanelOpen(false)}
          channelId={channel?.id ?? ""}
          clientUserId={client?.userID ?? ""}
          isMediator={isMediator}
          onReviewComplete={() => setLocalFreeze(null)}
        />
        <MemberPanel open={memberPanelOpen} onClose={() => setMemberPanelOpen(false)} />
      </div>
    </div>
  );
}

class ChannelErrorBoundary extends Component<{ children: React.ReactNode }> {
  state = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    if (error.message?.includes("client.disconnect")) return { hasError: true };
    return { hasError: false };
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

function ChatMainArea() {
  const { channel } = useChatContext();

  if (!channel) {
    return <NoChannelSelected />;
  }

  return (
    <ChannelErrorBoundary>
      <Channel>
        <ChannelContent />
      </Channel>
    </ChannelErrorBoundary>
  );
}

function ChatAvatar(props: Record<string, unknown>) {
  const { channel } = useChatContext();
  const { imageUrl, userName, size = "md", isOnline, name, displayMembers, ...rest } = props;
  void displayMembers;

  const resolvedName = (name as string | undefined) ?? (userName as string | undefined);

  let href: string | undefined;
  const lookupName = (name as string) || (userName as string);
  if (channel?.state?.members && lookupName) {
    const member = Object.values(channel.state.members).find(
      (m) => m.user?.name === lookupName || m.user?.id === lookupName
    );
    const username = member?.user?.username as string | undefined;
    if (username) href = `/cv/${username}`;
  }

  const avatar = (
    <StreamAvatar
      size={size as string | null}
      imageUrl={imageUrl as string | undefined}
      userName={resolvedName as string | undefined}
      isOnline={isOnline as boolean | undefined}
      {...rest}
    />
  );

  if (!href) return avatar;

  return (
    <Link href={href} onClick={(e) => e.stopPropagation()} style={{ display: "contents" }}>
      {avatar}
    </Link>
  );
}

function ChatView({
  client,
  tokenData,
}: {
  client: StreamChat;
  tokenData: {
    chatToken: string;
    apiKey: string;
    userId: string;
    name: string;
    role: string | null;
  };
}) {
  const { resolvedTheme } = useTheme();

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      <Chat client={client} theme={`str-chat__theme-${resolvedTheme ?? "light"}`}>
        <WithComponents
          overrides={{
            LoadingErrorIndicator: ChannelListError,
            Avatar: ChatAvatar,
          }}
        >
          <div
            className="flex h-full w-full"
            style={{ "--str-chat__channel-list-width": "320px" } as React.CSSProperties}
          >
            <ChannelList
              filters={{
                type: { $in: ["messaging"] },
                members: { $in: [tokenData.userId] },
              }}
              sort={defaultSort}
              options={options}
              EmptyStateIndicator={EmptyChannels}
              setActiveChannelOnMount={false}
            />
            <div className="flex flex-1 flex-col">
              <ChatMainArea />
            </div>
          </div>
        </WithComponents>
      </Chat>
    </div>
  );
}

export default function MessagesPage() {
  const { client, tokenData, error } = useStreamChat();

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="max-w-md text-center">
          <p className="text-destructive font-semibold">Konfigurasi Stream</p>
          <p className="text-muted-foreground mt-2 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!client || !tokenData) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Menghubungkan...</p>
      </div>
    );
  }

  return <ChatView client={client} tokenData={tokenData} />;
}
