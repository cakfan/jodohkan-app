"use client";

import { useEffect, useState, useCallback, Component } from "react";
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
import { Shield, Users, Trash2, X, Ban, OctagonXIcon, Crown } from "lucide-react";
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
import { useStreamChat } from "@/components/stream-chat-provider";
import {
  deleteTaarufChannel,
  banTaarufUser,
  unbanTaarufUser,
  freezeTaarufChannel,
  getChannelOwner,
} from "@/app/actions/stream";
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

function ChannelHeaderGroup({ onMemberPanelToggle }: { onMemberPanelToggle: () => void }) {
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
          <div className="text-muted-foreground/50 flex shrink-0 items-center gap-1 text-[10px]">
            <Shield className="size-3" />
            <span>Tidak bisa leave</span>
          </div>
        </div>
      </div>
    </>
  );
}

function ChannelContent() {
  const { channel } = useChatContext();
  const { messages } = useChannelStateContext();
  const [memberPanelOpen, setMemberPanelOpen] = useState(false);
  const isFrozen = channel?.data?.frozen === true;
  const hasMessages = messages && messages.length > 0;

  function useAllowedMessageActions() {
    const { client, channel } = useChatContext();

    const currentUserId = client?.userID;
    const members = channel?.state?.members ?? {};
    const currentMember = currentUserId ? members[currentUserId] : undefined;

    // cek channel_role, bukan created_by_id
    const isOwner =
      currentMember?.channel_role === "owner" || currentMember?.channel_role === "admin";

    if (isOwner) {
      return ["delete", "pin", "edit", "flag", "react", "reply", "quote"];
    }

    return ["react", "quote", "flag"];
  }

  const messageActions = useAllowedMessageActions();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ChannelHeaderGroup onMemberPanelToggle={() => setMemberPanelOpen((v) => !v)} />
      <div className="flex min-h-0 flex-1">
        <div className="flex min-h-0 flex-1 flex-col">
          {isFrozen && (
            <div className="bg-primary/5 text-primary flex items-center gap-2 px-4 py-2 text-xs font-medium">
              <Shield className="size-3.5" />
              <span>Ta&apos;aruf telah selesai. Tidak dapat mengirim pesan lagi.</span>
            </div>
          )}
          <div className="grid min-h-0 flex-1 grid-rows-[1fr_auto]">
            <div className="min-h-0">
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
            {!isFrozen && <MessageComposer />}
          </div>
        </div>
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
  const { imageUrl, userName, size = "md", isOnline, name, ...rest } = props;

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
