import { S3Client } from '@aws-sdk/client-s3';

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || '';
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || '';

export function getPublicImageUrl(key: string): string {
  // For settings/logo, use direct R2 URL
  // For user photos in buku tamu, use API route for security
  if (key.startsWith('logo-')) {
    return `${R2_PUBLIC_URL}/${key}`;
  }
  // Use our own API route to serve images (with security checks)
  return `/api/images/${key}`;
}
