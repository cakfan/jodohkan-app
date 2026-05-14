import "stream-chat";

declare module "stream-chat" {
  interface CustomChannelData {
    name?: string;
    frozen?: boolean;
    freeze_reason?: string | null;
    adab_freeze_reason?: string | null;
    adab_freeze_expires_at?: string | null;
    adab_freeze_permanent?: boolean;
  }
}
