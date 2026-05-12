"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useCreateChatClient, useChatContext, useChannelStateContext, WithComponents } from "stream-chat-react";
import { Chat, Channel, ChannelList, MessageList, MessageComposer, Avatar as StreamAvatar } from "stream-chat-react";
import { Shield, Users, Trash2, X, Ban, OctagonXIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
import { getStreamToken, deleteTaarufChannel, banTaarufUser, unbanTaarufUser, freezeTaarufChannel } from "@/app/actions/stream";
import "stream-chat-react/dist/css/index.css";
import "./chat-theme.css";

const defaultSort = { last_updated: -1 as const };
const options = { state: true, watch: true, limit: 100 };

function EmptyChannels() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="text-muted-foreground/40 mb-3 text-4xl">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <h3 className="mb-1 text-sm font-medium">Belum ada percakapan ta&apos;aruf</h3>
      <p className="text-muted-foreground mb-3 text-xs">
        Terima permintaan ta&apos;aruf untuk memulai chat.
      </p>
      <Link
        href="/taaruf"
        className="text-primary text-xs font-medium hover:underline"
      >
        Lihat Permintaan Ta&apos;aruf
      </Link>
    </div>
  );
}

function ChannelListError() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="text-muted-foreground/40 mb-3 text-4xl">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <h3 className="mb-1 text-sm font-medium">Belum ada percakapan ta&apos;aruf</h3>
      <p className="text-muted-foreground mb-3 text-xs">
        Terima permintaan ta&apos;aruf untuk memulai chat.
      </p>
      <Link
        href="/taaruf"
        className="text-primary text-xs font-medium hover:underline"
      >
        Lihat Permintaan Ta&apos;aruf
      </Link>
    </div>
  );
}

function NoChannelSelected() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="text-muted-foreground/40 mb-4 text-5xl">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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

function MemberPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
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
    client.queryBannedUsers({ channel_cid: channel.cid }).then((response) => {
      setBannedUserIds(new Set((response.bans ?? []).map((b) => b.user.id)));
    }).catch(() => {});
  }, [channel?.id, channel?.cid, client]);

  const members = channel?.state?.members
    ? Object.values(channel.state.members)
    : [];
  const mediator = members.find(
    (m: { channel_role?: string }) => m.channel_role === "channel_moderator"
  );
  const isMediator = mediator?.user?.id === client?.userID;

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

  const handleFreeze = async () => {
    if (!channel?.id) return;
    setFreezing(true);
    const result = await freezeTaarufChannel(channel.id, !isFrozen);
    if (result.success) {
      toast.success(isFrozen ? "Ta'aruf dibuka kembali" : "Ta'aruf diakhiri");
    } else {
      toast.error(result.error!);
    }
    setFreezing(false);
    setFreezeDialogOpen(false);
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
                <OctagonXIcon className="size-8 text-destructive" />
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
              <Shield className="size-8 text-primary" />
            </AlertDialogMedia>
            <AlertDialogTitle>
              {isFrozen ? "Buka Ta'aruf" : "Akhiri Ta'aruf"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isFrozen
                ? "Ta'aruf akan dibuka kembali. Peserta dapat mengirim pesan lagi."
                : "Ta'aruf akan ditutup. Peserta tidak dapat mengirim pesan lagi."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
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

      <div className="flex w-80 shrink-0 flex-col border-l bg-background">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Info Grup</h3>
          <Button variant="ghost" size="icon-sm" onClick={onClose} className="text-muted-foreground/50">
            <X className="size-4" />
          </Button>
        </div>

        <div className="border-b px-4 py-3">
          <h4 className="text-sm font-semibold">{channel?.data?.name ?? "Ta'aruf"}</h4>
          <p className="mt-0.5 text-xs text-muted-foreground">{members.length} peserta</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-3">
            <p className="mb-2 text-[10px] font-medium uppercase text-muted-foreground/60">
              {members.length} peserta
            </p>
            <div className="space-y-1">
              {members.map((m) => {
                const isMed = m.channel_role === "channel_moderator";
                const isBanned = bannedUserIds.has(m.user?.id ?? "");
                const isMe = m.user?.id === client?.userID;
                const isOtherParticipant = !isMed && !isMe;

                return (
                  <div
                    key={m.user?.id}
                    className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
                        {(m.user?.name ?? "?")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-sm">
                            {m.user?.name ?? m.user?.id}
                            {isMe ? " (Anda)" : ""}
                          </span>
                          {isBanned && <Ban className="size-3 shrink-0 text-destructive" />}
                        </div>
                        <div className="flex items-center gap-1">
                          {isMed && (
                            <span className="inline-flex items-center gap-0.5 rounded bg-primary/10 px-1 py-0.5 text-[9px] font-medium text-primary">
                              <Shield className="size-2.5" />
                              Mediator
                            </span>
                          )}
                          {isBanned && (
                            <span className="text-[9px] font-medium text-destructive">Diblokir</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isMediator && isOtherParticipant && (
                      <Button
                        variant="ghost"
                        size="xs"
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

function ChannelHeaderGroup({
  onMemberPanelToggle,
}: {
  onMemberPanelToggle: () => void;
}) {
  const { channel, client } = useChatContext();
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const members = channel?.state?.members
    ? Object.values(channel.state.members)
    : [];
  const mediator = members.find(
    (m: { channel_role?: string }) => m.channel_role === "channel_moderator"
  );
  const isMediator = mediator?.user?.id === client?.userID;

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
              <Trash2 className="size-8 text-destructive" />
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

      <div className="flex items-center gap-3 border-b px-4 py-3">
        <Button
          variant="ghost"
          onClick={onMemberPanelToggle}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-none px-0 text-left"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Users className="size-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-semibold">
              {channel?.data?.name ?? "Ta'aruf"}
            </h2>
            <p className="truncate text-xs text-muted-foreground">
              {members.length} peserta
              {mediator ? ` · ${mediator.user?.name ?? "Moderator"} mendampingi` : ""}
            </p>
          </div>
        </Button>
        <div className="flex shrink-0 items-center gap-2">
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
          <div className="flex shrink-0 items-center gap-1 text-[10px] text-muted-foreground/50">
            <Shield className="size-3" />
            <span>Tidak bisa leave</span>
          </div>
        </div>
      </div>
    </>
  );
}

function ChannelContent({ role }: { role?: string | null }) {
  const { channel } = useChatContext();
  const { messages } = useChannelStateContext();
  const [memberPanelOpen, setMemberPanelOpen] = useState(false);
  const isTaarufUser = role === "taaruf_user";
  const isFrozen = channel?.data?.frozen === true;
  const hasMessages = messages && messages.length > 0;

  return (
    <div className={`flex min-h-0 flex-1 flex-col${isTaarufUser ? " taaruf-hide-commands" : ""}`}>
      <ChannelHeaderGroup onMemberPanelToggle={() => setMemberPanelOpen((v) => !v)} />
      <div className="flex min-h-0 flex-1">
        <div className="flex flex-1 flex-col">
          {isFrozen && (
            <div className="flex items-center gap-2 bg-primary/5 px-4 py-2 text-xs font-medium text-primary">
              <Shield className="size-3.5" />
              <span>Ta&apos;aruf telah selesai. Tidak dapat mengirim pesan lagi.</span>
            </div>
          )}
          {hasMessages ? (
            <MessageList />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
              <div className="text-muted-foreground/40 mb-4 text-5xl">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
          {!isFrozen && <MessageComposer />}
        </div>
        <MemberPanel open={memberPanelOpen} onClose={() => setMemberPanelOpen(false)} />
      </div>
    </div>
  );
}

function ChatMainArea({ role }: { role?: string | null }) {
  const { channel } = useChatContext();

  if (!channel) {
    return <NoChannelSelected />;
  }

  return (
    <Channel>
      <ChannelContent role={role} />
    </Channel>
  );
}

function ChatAvatar(props: Record<string, unknown>) {
  const { channel } = useChatContext();
  const { imageUrl, userName, size, isOnline, displayMembers, ...domProps } = props;

  let href: string | undefined;
  if (channel?.state?.members && userName) {
    const member = Object.values(channel.state.members).find(
      (m) => m.user?.name === userName || m.user?.id === userName
    );
    const username = member?.user?.username as string | undefined;
    if (username) {
      href = `/cv/${username}`;
    }
  }

  const avatarProps = { imageUrl: imageUrl as string | undefined, userName: userName as string | undefined, size: size as string, isOnline: isOnline as boolean | undefined, ...domProps };

  if (!href) return <StreamAvatar {...avatarProps} />;

  return (
    <Link href={href} onClick={(e) => e.stopPropagation()}>
      <StreamAvatar {...avatarProps} />
    </Link>
  );
}

function ChatView({
  tokenData,
}: {
  tokenData: { chatToken: string; apiKey: string; userId: string; name: string; role: string | null };
}) {
  const { resolvedTheme } = useTheme();
  const chatClient = useCreateChatClient({
    apiKey: tokenData.apiKey,
    tokenOrProvider: tokenData.chatToken,
    userData: { id: tokenData.userId, name: tokenData.name },
  });

  if (!chatClient) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Menghubungkan...</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      <Chat client={chatClient} theme={`str-chat__theme-${resolvedTheme ?? "light"}`}>
        <WithComponents overrides={{ LoadingErrorIndicator: ChannelListError, Avatar: ChatAvatar }}>
          <div className="flex h-full w-full" style={{ "--str-chat__channel-list-width": "320px" } as React.CSSProperties}>
            <ChannelList
              filters={{ type: "messaging", members: { $in: [tokenData.userId] } }}
              sort={defaultSort}
              options={options}
              EmptyStateIndicator={EmptyChannels}
            />
          <div className="flex flex-1 flex-col">
            <ChatMainArea role={tokenData.role} />
          </div>
        </div>
        </WithComponents>
      </Chat>
    </div>
  );
}

export default function MessagesPage() {
  const [tokenData, setTokenData] = useState<{
    chatToken: string;
    apiKey: string;
    userId: string;
    name: string;
    role: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getStreamToken().then((data) => {
      if (data) {
        setTokenData(data);
      } else {
        setError("Gagal mendapatkan token chat. Pastikan STREAM_API_KEY dan STREAM_API_SECRET sudah diisi.");
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Memuat...</p>
      </div>
    );
  }

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

  if (!tokenData) {
    return null;
  }

  return <ChatView tokenData={tokenData} />;
}
