declare global {
  var _CONFIG: TopLevelConfig;
}

import { Client } from "minio";
import dotenv from "dotenv";
import { TopLevelConfig } from "../config/types/config";
import initConfig from "../config";
let _CONFIG: TopLevelConfig | null = null;
const initializeConfig = async (): Promise<TopLevelConfig> => {
  if (!_CONFIG) {
    _CONFIG = await initConfig();
  }

  return _CONFIG;
};
dotenv.config();

export const initializeMinioClient = async (): Promise<Client> => {
  const config = await initializeConfig();
  return new Client({
    endPoint: config.MINIO_ENDPOINT,
    port: config.PORT_MINIO,
    useSSL: false,
    accessKey: config.MINIO_ACCESS_KEY,
    secretKey: config.MINIO_SECRET_KEY,
  });
};
export let minioClient: Client;

(async () => {
  minioClient = await initializeMinioClient();
})();
export const setBucketPolicy = async (bucketName: string): Promise<void> => {
  try {
    const publicBucketPolicy = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: "*",
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${bucketName}/*`],
        },
      ],
    };

    // Convert the policy to a JSON string
    const policy = JSON.stringify(publicBucketPolicy);

    // Set the bucket policy
    await minioClient.setBucketPolicy(bucketName, policy);
    console.log(`✅ Public policy applied to bucket "${bucketName}".`);
  } catch (error) {
    console.error(`Error setting bucket policy for "${bucketName}":`, error);
    throw new Error(`Error setting bucket policy for "${bucketName}".`);
  }
};
export const storeFileToMinio = async (
  fileName: string,
  fileBuffer: Buffer,
  mimeType: string,
  bucketName: string
): Promise<string> => {
  try {
    // Ensure the bucket exists
    // const bucketExists = await minioClient.bucketExists(bucketName);
    // if (!bucketExists) {
    //   await minioClient.makeBucket(bucketName, 'us-east-1');
    //   console.log(`✅ Bucket "${bucketName}" created.`);
    //   await setBucketPolicy();

    // }

    // Upload the file to MinIO
    await minioClient.putObject(
      bucketName,
      fileName,
      fileBuffer,
      fileBuffer.length,
      {
        "Content-Type": mimeType,
      }
    );
    console.log(`✅ File uploaded to MinIO: ${fileName}`);
    // Construct the public URL
    const url = `http://${global._CONFIG.MINIO_ENDPOINT}:${global._CONFIG.PORT_MINIO}/${bucketName}/${fileName}`;
    return url;
  } catch (error) {
    console.error("Error uploading file to MinIO:", error);
    throw new Error("Error uploading file to MinIO.");
  }
};

export const checkFileExistsInMinio = async (
  fileName: string,
  bucketName: string
): Promise<boolean> => {
  try {
    console.log(`Checking if file exists in MinIO: ${fileName}`);
    console.log(`Bucket Name: ${bucketName}`);

    // Ensure the bucket exists
    // const bucketExists = await minioClient.bucketExists(bucketName);
    // console.log(`Bucket Exists: ${bucketExists}`);

    // if (!bucketExists) {
    //   await minioClient.makeBucket(bucketName, 'us-east-1');
    //   console.log(`✅ Bucket "${bucketName}" created.`);

    //   await setBucketPolicy();

    // }

    // Check if the object exists
    await minioClient.statObject(bucketName, fileName);
    console.log(`✅ File exists in MinIO: ${fileName}`);
    return true;
  } catch (error: any) {
    console.log(`❌ File does not exist in MinIO: ${fileName}`);
    return false;
  }
};

export const getFile = async (
  htmlFileName: string,
  bucketName: string
): Promise<any> => {
  try {
    console.log(`Checking if file exists in MinIO: ${htmlFileName}`);

    // Ensure the bucket exists
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      console.log(`Bucket "${bucketName}" does not exist. Creating it...`);
      await minioClient.makeBucket(bucketName, "us-east-1");
      console.log(`✅ Bucket "${bucketName}" created.`);
      await setBucketPolicy(bucketName);
    }

    // Retrieve the object from MinIO
    const data = await minioClient.getObject(bucketName, htmlFileName);
    console.log(`✅ File exists in MinIO: ${data}`);
    return data;
  } catch (error: any) {
    if (error.code === "NotFound") {
      console.log(`❌ File does not exist in MinIO: ${error}`);
      return false;
    }
    console.error("Error checking file in MinIO:", error);
    throw new Error("Error checking file in MinIO.");
  }
};

export const deleteFileFromMinio = async (
  fileName: string,
  bucketName: string
): Promise<void> => {
  try {
    // Ensure the bucket exists
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      console.error(`❌ Bucket "${bucketName}" does not exist.`);
      throw new Error(`Bucket "${bucketName}" does not exist.`);
    }

    // Delete the file from MinIO
    await minioClient.removeObject(bucketName, fileName);
    console.log(`✅ File deleted from MinIO: ${fileName}`);
  } catch (error) {
    console.error("Error deleting file from MinIO:", error);
    throw new Error("Error deleting file from MinIO.");
  }
};
