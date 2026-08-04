import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: String(process.env.AWS_ACCESS_KEY_ID),
    secretAccessKey: String(process.env.AWS_SECRET_ACCESS_KEY),
  },
});

export class S3Service {
  static bucket = String(process.env.AWS_BUCKET_NAME);

  static buildUrl(s3Key: string) {
    return `https://${S3Service.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
  }

  static async getUploadUrl({ key, mimeType }: { key: string; mimeType: string }, expiresInSeconds = 900) {
    const command = new PutObjectCommand({ Bucket: S3Service.bucket, Key: key, ContentType: mimeType });
    return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
  }

  static async delete(s3Key: string) {
    await s3Client.send(
      new DeleteObjectCommand({ Bucket: S3Service.bucket, Key: s3Key })
    );
  }

  static async getPresignedUrl(s3Key: string, expiresInSeconds = 3600) {
    const command = new GetObjectCommand({ Bucket: S3Service.bucket, Key: s3Key });
    return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
  }
}
