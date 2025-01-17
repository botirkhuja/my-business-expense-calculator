// utils/minioClient.ts
import { Client } from "minio";

export const minioServerUrl = process.env.MINIO_SERVER_URL;
export const minioServerPort = process.env.MINIO_SERVER_PORT;

const minioClient = new Client({
  endPoint: process.env.MINIO_SERVER_URL as string, // Replace with your MinIO server URL
  port: parseInt(process.env.MINIO_SERVER_PORT as string), // Replace with your MinIO server port if different
  useSSL: Boolean(process.env.MINIO_SERVER_USE_SSL), // Set true if SSL is enabled
  accessKey: process.env.MINIO_SERVER_ACCESS_KEY as string, // Replace with your access key
  secretKey: process.env.MINIO_SERVER_SECRET_KEY as string, // Replace with your secret key
});

export default minioClient;
