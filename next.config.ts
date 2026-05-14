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
};

export default nextConfig;
