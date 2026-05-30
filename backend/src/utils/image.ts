import sharp from 'sharp';

export async function resizeImage(buffer: Buffer, maxSide = 1024): Promise<Buffer> {
  return sharp(buffer)
    .rotate()
    .resize(maxSide, maxSide, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();
}
