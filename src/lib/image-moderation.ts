import sharp from "sharp";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-cpu";
import type { NSFWJS } from "nsfwjs";
interface FaceDetector {
  estimateFaces(
    tensor: tf.Tensor3D
  ): Promise<Array<{ box: { xMin: number; yMin: number; xMax: number; yMax: number; width: number; height: number }; keypoints: Array<{ x: number; y: number; name?: string }> }>>;
}

tf.env().set("IS_NODE", true);

let nsfwModel: NSFWJS | null = null;
let faceModel: FaceDetector | null = null;

async function getNsfwModel() {
  if (!nsfwModel) {
    const nsfw = await import("nsfwjs");
    nsfwModel = await nsfw.load();
  }
  return nsfwModel;
}

async function getFaceModel() {
  if (!faceModel) {
    const fd = await import("@tensorflow-models/face-detection");
    faceModel = await fd.createDetector(
      fd.SupportedModels.MediaPipeFaceDetector,
      { runtime: "tfjs" }
    );
  }
  return faceModel;
}

function bufferToTensor(buffer: Buffer, width: number, height: number): tf.Tensor3D {
  const pixels = new Uint8Array(buffer);
  const channels = 3;
  const shape: [number, number, number] = [height, width, channels];
  return tf.tensor3d(pixels, shape);
}

async function decodeImage(buffer: Buffer) {
  const metadata = await sharp(buffer).metadata();
  if (!metadata.width || !metadata.height) throw new Error("Gagal membaca dimensi gambar");

  const resized = await sharp(buffer)
    .resize(640, 640, { fit: "inside" })
    .flatten()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return { raw: resized.data, width: resized.info.width, height: resized.info.height };
}

export interface ModerationResult {
  passed: boolean;
  faceDetected: boolean;
  nudityDetected: boolean;
  message: string;
}

export async function moderateImage(buffer: Buffer): Promise<ModerationResult> {
  const { raw, width, height } = await decodeImage(buffer);

  const tensor = bufferToTensor(raw, width, height);

  try {
    const [faceResult, nsfwResult] = await Promise.all([
      detectFace(tensor),
      classifyNudity(tensor),
    ]);

    if (nsfwResult.flagged) {
      return {
        passed: false,
        faceDetected: faceResult.detected,
        nudityDetected: nsfwResult.isNudity,
        message: nsfwResult.message,
      };
    }

    if (!faceResult.detected) {
      return {
        passed: false,
        faceDetected: false,
        nudityDetected: false,
        message: faceResult.message,
      };
    }

    const geomResult = checkFaceGeometry(faceResult);
    if (!geomResult.valid) {
      return {
        passed: false,
        faceDetected: true,
        nudityDetected: false,
        message: geomResult.message,
      };
    }

    return {
      passed: true,
      faceDetected: true,
      nudityDetected: false,
      message: "Foto valid",
    };
  } finally {
    tensor.dispose();
  }
}

async function detectFace(tensor: tf.Tensor3D) {
  const model = await getFaceModel();
  const predictions = await model.estimateFaces(tensor);

  if (predictions.length === 0) {
    return { detected: false as const, message: "Tidak terdeteksi wajah. Pastikan foto berisi wajah yang jelas." };
  }

  return { detected: true as const, data: predictions[0], message: "" };
}

export function checkFaceGeometry(faceResult: { detected: true; data: { box: { xMin: number; yMin: number; xMax: number; yMax: number; width: number; height: number }; keypoints: Array<{ x: number; y: number; name?: string }> }; message: string }) {
  const face = faceResult.data;
  const hwRatio = face.box.height / face.box.width;
  const eyeKps = face.keypoints.filter((k) => k.name?.includes("Eye"));

  if (eyeKps.length >= 2) {
    const avgEyeY = eyeKps.reduce((s, k) => s + k.y, 0) / eyeKps.length;
    const eyeRatio = (avgEyeY - face.box.yMin) / face.box.height;

    if (hwRatio < 1.05 && eyeRatio < 0.18) {
      return { valid: false, message: "Proporsi wajah tidak natural. Gunakan foto asli, bukan gambar." };
    }
  }

  return { valid: true, message: "" };
}

export function classifyNudityFromPredictions(predictions: Array<{ className: string; probability: number }>) {
  const drawing = predictions.find((p) => p.className === "Drawing");
  const porn = predictions.find((p) => p.className === "Porn");
  const hentai = predictions.find((p) => p.className === "Hentai");
  const sexy = predictions.find((p) => p.className === "Sexy");

  if ((drawing?.probability ?? 0) > 0.25) {
    return { flagged: true, isNudity: false, message: "Foto harus berupa foto asli, bukan gambar atau ilustrasi." };
  }

  if ((porn?.probability ?? 0) > 0.5) {
    return { flagged: true, isNudity: true, message: "Foto mengandung konten tidak pantas. Unggah foto yang sesuai syariah." };
  }

  if ((hentai?.probability ?? 0) > 0.5) {
    return { flagged: true, isNudity: true, message: "Foto mengandung konten tidak pantas. Unggah foto yang sesuai syariah." };
  }

  if ((sexy?.probability ?? 0) > 0.8) {
    return { flagged: true, isNudity: true, message: "Foto terlalu terbuka. Gunakan foto yang lebih sopan dan menutup aurat." };
  }

  return { flagged: false, isNudity: false, message: "" };
}

async function classifyNudity(tensor: tf.Tensor3D) {
  const model = await getNsfwModel();
  const predictions = await model.classify(tensor);
  return classifyNudityFromPredictions(predictions);
}
