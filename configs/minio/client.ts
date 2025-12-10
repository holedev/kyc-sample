import { Client } from "minio";

if (!process.env.MINIO_ENDPOINT) {
  throw new Error("MINIO_ENDPOINT is required");
}
if (!process.env.MINIO_ACCESS_KEY) {
  throw new Error("MINIO_ACCESS_KEY is required");
}
if (!process.env.MINIO_SECRET_KEY) {
  throw new Error("MINIO_SECRET_KEY is required");
}

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: Number.parseInt(process.env.MINIO_PORT || "9000", 10),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY
});

export const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || "kyc-sample";

export { minioClient };
