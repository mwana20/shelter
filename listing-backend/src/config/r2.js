import { S3Client } from '@aws-sdk/client-s3';
import { env } from './env.js';

let s3Client = null;

if (env.R2.ACCOUNT_ID && env.R2.ACCESS_KEY_ID && env.R2.SECRET_ACCESS_KEY) {
  s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${env.R2.ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2.ACCESS_KEY_ID,
      secretAccessKey: env.R2.SECRET_ACCESS_KEY
    }
  });
}

export { s3Client };
