import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadService implements OnModuleInit {
  private readonly logger = new Logger(UploadService.name);
  private client: Minio.Client;
  private bucket: string;
  private publicUrl: string;

  constructor(private config: ConfigService) {
    this.client = new Minio.Client({
      endPoint: this.config.get('MINIO_ENDPOINT', 'localhost'),
      port: parseInt(this.config.get('MINIO_PORT', '9000')),
      useSSL: false,
      accessKey: this.config.get('MINIO_ACCESS_KEY', 'barblink'),
      secretKey: this.config.get('MINIO_SECRET_KEY', 'barblink_dev_minio'),
    });
    this.bucket = this.config.get('MINIO_BUCKET', 'barblink-media');
    this.publicUrl = this.config.get('MINIO_PUBLIC_URL', 'http://localhost:9000');
  }

  async onModuleInit() {
    try {
      const exists = await this.client.bucketExists(this.bucket);
      if (!exists) {
        await this.client.makeBucket(this.bucket);
        // Set bucket policy to public read
        const policy = JSON.stringify({
          Version: '2012-10-17',
          Statement: [{
            Effect: 'Allow',
            Principal: '*',
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.bucket}/*`],
          }],
        });
        await this.client.setBucketPolicy(this.bucket, policy);
        this.logger.log(`Created bucket: ${this.bucket}`);
      }
    } catch (error: any) {
      this.logger.warn(`MinIO setup: ${error.message}. Uploads may not work.`);
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'posts',
  ): Promise<string> {
    const ext = file.originalname.split('.').pop() || 'jpg';
    const key = `${folder}/${randomUUID()}.${ext}`;

    await this.client.putObject(
      this.bucket,
      key,
      file.buffer,
      file.size,
      { 'Content-Type': file.mimetype },
    );

    return `${this.publicUrl}/${this.bucket}/${key}`;
  }

  async deleteFile(url: string): Promise<void> {
    try {
      const key = url.split(`/${this.bucket}/`)[1];
      if (key) {
        await this.client.removeObject(this.bucket, key);
      }
    } catch {
      // Silent — file might not exist
    }
  }
}
