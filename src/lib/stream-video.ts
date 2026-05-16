import { StreamClient } from "@stream-io/node-sdk";

let videoClient: StreamClient | null = null;

export function getStreamVideoClient(): StreamClient {
  if (!videoClient) {
    const apiKey = process.env.STREAM_API_KEY;
    const apiSecret = process.env.STREAM_API_SECRET;
    if (!apiKey || !apiSecret) {
      throw new Error("STREAM_API_KEY and STREAM_API_SECRET must be set");
    }
    videoClient = new StreamClient(apiKey, apiSecret);
  }
  return videoClient;
}
