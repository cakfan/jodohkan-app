import { expect, test, describe } from "bun:test";
import { checkFaceGeometry, classifyNudityFromPredictions, type ModerationResult } from "@/lib/image-moderation";

function makeFace(hwRatio: number, eyeRatio: number) {
  const boxHeight = 300;
  const boxWidth = boxHeight / hwRatio;
  const yMin = 0;
  const eyeY = yMin + boxHeight * eyeRatio;
  return {
    detected: true as const,
    data: {
      box: { xMin: 0, xMax: boxWidth, yMin, yMax: boxHeight, width: boxWidth, height: boxHeight },
      keypoints: [
        { x: 100, y: eyeY, name: "rightEye" },
        { x: 200, y: eyeY - 5, name: "leftEye" },
        { x: 150, y: eyeY + 40, name: "noseTip" },
        { x: 150, y: eyeY + 100, name: "mouthCenter" },
        { x: 30, y: eyeY + 20, name: "rightEarTragion" },
        { x: 270, y: eyeY + 15, name: "leftEarTragion" },
      ],
    },
    message: "",
  };
}

function makeFaceNoEyes() {
  return {
    detected: true as const,
    data: {
      box: { xMin: 0, xMax: 300, yMin: 0, yMax: 300, width: 300, height: 300 },
      keypoints: [
        { x: 100, y: 100, name: "noseTip" },
        { x: 150, y: 200, name: "mouthCenter" },
      ],
    },
    message: "",
  };
}

describe("checkFaceGeometry", () => {
  test("passes normal face proportions", () => {
    const result = checkFaceGeometry(makeFace(1.4, 0.35));
    expect(result.valid).toBe(true);
  });

  test("passes slightly square face with normal eye position", () => {
    const result = checkFaceGeometry(makeFace(1.03, 0.3));
    expect(result.valid).toBe(true);
  });

  test("passes normal face width with high eyes", () => {
    const result = checkFaceGeometry(makeFace(1.2, 0.15));
    expect(result.valid).toBe(true);
  });

  test("rejects anime proportions: square face AND high eyes", () => {
    const result = checkFaceGeometry(makeFace(1.0, 0.15));
    expect(result.valid).toBe(false);
    expect(result.message).toBe("Proporsi wajah tidak natural. Gunakan foto asli, bukan gambar.");
  });

  test("passes square face with eyes at 23% (caught by NSFW Drawing check instead)", () => {
    const result = checkFaceGeometry(makeFace(1.0, 0.23));
    expect(result.valid).toBe(true);
  });

  test("rejects at exact boundary: hw=1.04 eye=0.17", () => {
    const result = checkFaceGeometry(makeFace(1.04, 0.17));
    expect(result.valid).toBe(false);
  });

  test("passes at exact safe boundary: hw=1.06 eye=0.17", () => {
    const result = checkFaceGeometry(makeFace(1.06, 0.17));
    expect(result.valid).toBe(true);
  });

  test("passes at exact safe boundary: hw=1.04 eye=0.19", () => {
    const result = checkFaceGeometry(makeFace(1.04, 0.19));
    expect(result.valid).toBe(true);
  });

  test("passes when fewer than 2 eye keypoints (skip geometry check)", () => {
    const face = makeFaceNoEyes();
    const result = checkFaceGeometry(face);
    expect(result.valid).toBe(true);
  });
});

describe("classifyNudityFromPredictions", () => {
  test("passes neutral image", () => {
    const result = classifyNudityFromPredictions([
      { className: "Neutral", probability: 0.95 },
      { className: "Drawing", probability: 0.03 },
      { className: "Hentai", probability: 0.01 },
      { className: "Porn", probability: 0.01 },
      { className: "Sexy", probability: 0.0 },
    ]);
    expect(result.flagged).toBe(false);
  });

  test("flags Drawing > 25% as non-nudity", () => {
    const result = classifyNudityFromPredictions([
      { className: "Neutral", probability: 0.6 },
      { className: "Drawing", probability: 0.35 },
      { className: "Hentai", probability: 0.03 },
      { className: "Porn", probability: 0.02 },
      { className: "Sexy", probability: 0.0 },
    ]);
    expect(result.flagged).toBe(true);
    expect(result.isNudity).toBe(false);
    expect(result.message).toBe("Foto harus berupa foto asli, bukan gambar atau ilustrasi.");
  });

  test("flags Porn > 50% as nudity", () => {
    const result = classifyNudityFromPredictions([
      { className: "Neutral", probability: 0.3 },
      { className: "Drawing", probability: 0.1 },
      { className: "Hentai", probability: 0.05 },
      { className: "Porn", probability: 0.55 },
      { className: "Sexy", probability: 0.0 },
    ]);
    expect(result.flagged).toBe(true);
    expect(result.isNudity).toBe(true);
    expect(result.message).toBe("Foto mengandung konten tidak pantas. Unggah foto yang sesuai syariah.");
  });

  test("flags Hentai > 50% as nudity", () => {
    const result = classifyNudityFromPredictions([
      { className: "Neutral", probability: 0.2 },
      { className: "Drawing", probability: 0.1 },
      { className: "Hentai", probability: 0.6 },
      { className: "Porn", probability: 0.1 },
      { className: "Sexy", probability: 0.0 },
    ]);
    expect(result.flagged).toBe(true);
    expect(result.isNudity).toBe(true);
  });

  test("flags Sexy > 80% as nudity", () => {
    const result = classifyNudityFromPredictions([
      { className: "Neutral", probability: 0.1 },
      { className: "Drawing", probability: 0.05 },
      { className: "Hentai", probability: 0.05 },
      { className: "Porn", probability: 0.0 },
      { className: "Sexy", probability: 0.9 },
    ]);
    expect(result.flagged).toBe(true);
    expect(result.isNudity).toBe(true);
    expect(result.message).toBe("Foto terlalu terbuka. Gunakan foto yang lebih sopan dan menutup aurat.");
  });

  test("does not flag Sexy exactly at 80%", () => {
    const result = classifyNudityFromPredictions([
      { className: "Neutral", probability: 0.7 },
      { className: "Drawing", probability: 0.1 },
      { className: "Hentai", probability: 0.05 },
      { className: "Porn", probability: 0.0 },
      { className: "Sexy", probability: 0.8 },
    ]);
    expect(result.flagged).toBe(false);
  });

  test("prioritizes Drawing over Porn when both exceed threshold", () => {
    const result = classifyNudityFromPredictions([
      { className: "Neutral", probability: 0.0 },
      { className: "Drawing", probability: 0.3 },
      { className: "Hentai", probability: 0.0 },
      { className: "Porn", probability: 0.6 },
      { className: "Sexy", probability: 0.0 },
    ]);
    expect(result.flagged).toBe(true);
    expect(result.isNudity).toBe(false);
    expect(result.message).toBe("Foto harus berupa foto asli, bukan gambar atau ilustrasi.");
  });

  test("passes image with Drawing exactly at 25%", () => {
    const result = classifyNudityFromPredictions([
      { className: "Neutral", probability: 0.7 },
      { className: "Drawing", probability: 0.25 },
      { className: "Hentai", probability: 0.03 },
      { className: "Porn", probability: 0.02 },
      { className: "Sexy", probability: 0.0 },
    ]);
    expect(result.flagged).toBe(false);
  });

  test("passes image with Porn exactly at 50%", () => {
    const result = classifyNudityFromPredictions([
      { className: "Neutral", probability: 0.4 },
      { className: "Drawing", probability: 0.05 },
      { className: "Hentai", probability: 0.05 },
      { className: "Porn", probability: 0.5 },
      { className: "Sexy", probability: 0.0 },
    ]);
    expect(result.flagged).toBe(false);
  });

  test("handles empty predictions array", () => {
    const result = classifyNudityFromPredictions([]);
    expect(result.flagged).toBe(false);
  });

  test("handles missing classification categories", () => {
    const result = classifyNudityFromPredictions([
      { className: "Neutral", probability: 0.9 },
    ]);
    expect(result.flagged).toBe(false);
  });
});

describe("ModerationResult interface structure", () => {
  test("ModerationResult has correct shape", () => {
    const result: ModerationResult = {
      passed: true,
      faceDetected: true,
      nudityDetected: false,
      message: "Foto valid",
    };
    expect(result).toHaveProperty("passed");
    expect(result).toHaveProperty("faceDetected");
    expect(result).toHaveProperty("nudityDetected");
    expect(result).toHaveProperty("message");
  });
});
