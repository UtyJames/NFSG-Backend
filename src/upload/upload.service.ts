import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private config: ConfigService) {
    this.bucket = config.getOrThrow('R2_BUCKET_NAME');
    this.publicUrl = config.getOrThrow('R2_PUBLIC_URL').replace(/\/$/, '');

    const rawAccountId = config.getOrThrow<string>('R2_ACCOUNT_ID');
    const accountId = rawAccountId
      .replace(/^https?:\/\//, '')
      .replace(/\.r2\.cloudflarestorage\.com.*$/, '');

    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.getOrThrow('R2_ACCESS_KEY_ID'),
        secretAccessKey: config.getOrThrow('R2_SECRET_ACCESS_KEY'),
      },
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'certificates',
  ): Promise<string> {
    const ext = file.originalname.split('.').pop();
    const key = `${folder}/${randomUUID()}.${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ContentLength: file.size,
      }),
    );

    return `${this.publicUrl}/${key}`;
  }
}
