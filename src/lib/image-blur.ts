import sharp from "sharp";

export async function blurImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(200, 200, { fit: "cover" })
    .blur(50)
    .jpeg({ quality: 60 })
    .toBuffer();
}
