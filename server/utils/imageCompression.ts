import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  progressive?: boolean;
}

export interface CompressedImageResult {
  buffer: Buffer;
  filename: string;
  size: number;
  width: number;
  height: number;
  format: string;
}

const defaultOptions: ImageCompressionOptions = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 85,
  format: 'webp',
  progressive: true
};

/**
 * Compress and optimize image
 */
export async function compressImage(
  inputBuffer: Buffer,
  originalFilename: string,
  options: ImageCompressionOptions = {}
): Promise<CompressedImageResult> {
  const opts = { ...defaultOptions, ...options };
  
  try {
    let pipeline = sharp(inputBuffer);
    
    // Get original metadata
    const metadata = await pipeline.metadata();
    
    // Resize if needed
    if (opts.maxWidth || opts.maxHeight) {
      pipeline = pipeline.resize(opts.maxWidth, opts.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }
    
    // Apply format and quality
    switch (opts.format) {
      case 'jpeg':
        pipeline = pipeline.jpeg({ 
          quality: opts.quality,
          progressive: opts.progressive 
        });
        break;
      case 'png':
        pipeline = pipeline.png({ 
          quality: opts.quality,
          progressive: opts.progressive,
          compressionLevel: 9
        });
        break;
      case 'webp':
      default:
        pipeline = pipeline.webp({ 
          quality: opts.quality 
        });
        break;
    }
    
    const outputBuffer = await pipeline.toBuffer();
    const outputMetadata = await sharp(outputBuffer).metadata();
    
    // Generate new filename
    const ext = path.extname(originalFilename);
    const basename = path.basename(originalFilename, ext);
    const newFilename = `${basename}.${opts.format}`;
    
    return {
      buffer: outputBuffer,
      filename: newFilename,
      size: outputBuffer.length,
      width: outputMetadata.width || 0,
      height: outputMetadata.height || 0,
      format: opts.format || 'webp'
    };
  } catch (error) {
    console.error('Image compression error:', error);
    throw new Error('Failed to compress image');
  }
}

/**
 * Create multiple image variants (thumbnail, medium, large)
 */
export async function createImageVariants(
  inputBuffer: Buffer,
  originalFilename: string
): Promise<{
  thumbnail: CompressedImageResult;
  medium: CompressedImageResult;
  large: CompressedImageResult;
  original: CompressedImageResult;
}> {
  const basename = path.basename(originalFilename, path.extname(originalFilename));
  
  const [thumbnail, medium, large, original] = await Promise.all([
    compressImage(inputBuffer, `${basename}_thumb.webp`, {
      maxWidth: 150,
      maxHeight: 150,
      quality: 75
    }),
    compressImage(inputBuffer, `${basename}_medium.webp`, {
      maxWidth: 600,
      maxHeight: 600,
      quality: 80
    }),
    compressImage(inputBuffer, `${basename}_large.webp`, {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 85
    }),
    compressImage(inputBuffer, `${basename}_original.webp`, {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 90
    })
  ]);
  
  return { thumbnail, medium, large, original };
}

/**
 * Save compressed image to file system
 */
export async function saveCompressedImage(
  compressedImage: CompressedImageResult,
  uploadDir: string
): Promise<string> {
  await fs.mkdir(uploadDir, { recursive: true });
  
  const filePath = path.join(uploadDir, compressedImage.filename);
  await fs.writeFile(filePath, compressedImage.buffer);
  
  return filePath;
}

/**
 * Validate image file
 */
export function isValidImageFile(filename: string, mimeType?: string): boolean {
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const validMimeTypes = [
    'image/jpeg',
    'image/png', 
    'image/webp',
    'image/gif'
  ];
  
  const ext = path.extname(filename).toLowerCase();
  const hasValidExtension = validExtensions.includes(ext);
  const hasValidMimeType = !mimeType || validMimeTypes.includes(mimeType);
  
  return hasValidExtension && hasValidMimeType;
}

/**
 * Get optimized image URL for different screen sizes
 */
export function getOptimizedImageUrl(
  baseUrl: string,
  variant: 'thumbnail' | 'medium' | 'large' | 'original' = 'medium'
): string {
  if (!baseUrl) return '';
  
  // If already has variant suffix, return as is
  if (baseUrl.includes('_thumb') || baseUrl.includes('_medium') || 
      baseUrl.includes('_large') || baseUrl.includes('_original')) {
    return baseUrl;
  }
  
  // Add variant suffix
  const ext = path.extname(baseUrl);
  const basename = baseUrl.replace(ext, '');
  return `${basename}_${variant}${ext}`;
}
