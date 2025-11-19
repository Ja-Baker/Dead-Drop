// Storage service for file uploads
// Supports AWS S3 or Railway volumes

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { AppError } from '../middleware/errorHandler';

class StorageService {
  private s3Client: S3Client | null = null;
  private bucketName: string;
  private useS3: boolean;

  constructor() {
    this.bucketName = process.env.S3_BUCKET_NAME || '';
    this.useS3 = !!(
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      this.bucketName
    );

    if (this.useS3) {
      this.s3Client = new S3Client({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
      });
    }
  }

  async uploadFile(
    key: string,
    buffer: Buffer,
    contentType: string
  ): Promise<string> {
    if (this.useS3 && this.s3Client) {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      });

      await this.s3Client.send(command);
      return `s3://${this.bucketName}/${key}`;
    } else {
      // Use local storage or Railway volumes
      // For now, return a placeholder path
      // In production, implement file system storage
      return `storage/${key}`;
    }
  }

  async deleteFile(key: string): Promise<void> {
    if (this.useS3 && this.s3Client) {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
    } else {
      // Delete from local storage
      // TODO: Implement file system deletion
    }
  }

  getFileUrl(key: string): string {
    if (this.useS3) {
      return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
    } else {
      return `${process.env.APP_URL}/storage/${key}`;
    }
  }
}

export const storageService = new StorageService();

