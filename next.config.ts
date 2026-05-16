import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tglsqgabtspzzymhhldx.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  serverExternalPackages: [
    "@tensorflow/tfjs",
    "@tensorflow/tfjs-backend-cpu",
    "@tensorflow-models/face-detection",
    "@mediapipe/face_detection",
    "nsfwjs",
  ],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.stream-io-api.com https://*.supabase.co",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://*.supabase.co https://*.stream-io-api.com",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co https://*.stream-io-api.com wss://*.stream-io-api.com https://api.xendit.co wss://*.supabase.co",
              "frame-src 'self' https://*.supabase.co",
              "media-src 'self' https://*.stream-io-api.com",
              "worker-src 'self' blob:",
            ].join("; "),
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
