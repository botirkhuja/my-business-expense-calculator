import minioClient, { minioServerUrl } from "@/lib/minioClient";

export async function uploadTransactionReceipt(
  file: File,
  transactionId: string,
) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const contentType = file.type || "application/octet-stream";
  const fileName = `${transactionId}/images/${file.name}`;
  const bucketName = "transaction-images";

  // Ensure bucket exists
  const bucketExists = await minioClient
    .bucketExists(bucketName)
    .catch(() => false);
  if (!bucketExists) await minioClient.makeBucket(bucketName);

  // Upload to MinIO
  await minioClient.putObject(bucketName, fileName, buffer, buffer.length, {
    "Content-Type": contentType,
  });

  // Generate file URL
  // const fileUrl = uploadedObjectInfo;
  // return fileUrl;
  return `https://${minioServerUrl}/${bucketName}/${fileName}`;
}

// const uploadFile = async (file: File): Promise<string> => {
//   const bucketName = "transaction-images";
//   const objectName = `${Date.now()}-${file.name}`;

//   // Ensure bucket exists
//   const bucketExists = await minioClient
//     .bucketExists(bucketName)
//     .catch(() => false);
//   if (!bucketExists) await minioClient.makeBucket(bucketName);

//   // Upload file
//   await minioClient.fPutObject(bucketName, objectName, file.);

//   // Return file URL
//   return `${minioClient.protocol}://${minioClient.endPoint}:${minioClient.port}/${bucketName}/${objectName}`;
// };
