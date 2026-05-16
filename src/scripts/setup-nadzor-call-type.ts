import { StreamClient } from "@stream-io/node-sdk";

async function main() {
  const apiKey = process.env.STREAM_API_KEY;
  const apiSecret = process.env.STREAM_API_SECRET;
  if (!apiKey || !apiSecret) {
    console.error("STREAM_API_KEY and STREAM_API_SECRET must be set");
    process.exit(1);
  }
  const client = new StreamClient(apiKey, apiSecret, { timeout: 15000 });

  console.log("Creating 'nadzor' call type...");

  const userGrants = [
    "create-call",
    "read-call",
    "join-call",
    "send-audio",
    "send-video",
    "screenshare",
    "update-call-permissions",
  ];

  const moderatorGrants = [
    ...userGrants,
    "mute-users",
    "end-call",
    "kick-user",
    "update-call",
    "update-call-member",
    "join-ended-call",
  ];

  const adminGrants = [
    "create-call",
    "read-call",
    "join-call",
    "send-audio",
    "send-video",
    "screenshare",
    "update-call-permissions",
    "mute-users",
    "end-call",
    "kick-user",
    "update-call",
    "update-call-member",
    "join-ended-call",
    "join-backstage",
  ];

  try {
    await client.video.createCallType({
      name: "nadzor",
      grants: {
        user: userGrants,
        moderator: moderatorGrants,
        admin: adminGrants,
      },
      settings: {
        recording: {
          mode: "disabled",
        },
        broadcasting: {
          enabled: false,
        },
      },
    });
    console.log("Call type 'nadzor' created successfully!");
  } catch (e) {
    if (e instanceof Error && e.message?.includes("already exists")) {
      console.log("Call type 'nadzor' already exists, updating...");
      await client.video.updateCallType({
        name: "nadzor",
        grants: {
          user: userGrants,
          moderator: moderatorGrants,
          admin: adminGrants,
        },
        settings: {
          recording: {
            mode: "disabled",
          },
          broadcasting: {
            enabled: false,
          },
        },
      });
      console.log("Call type 'nadzor' updated successfully!");
    } else {
      console.error("Failed to create 'nadzor' call type:", e);
      process.exit(1);
    }
  }
}

main();
