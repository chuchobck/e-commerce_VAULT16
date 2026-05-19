import { BlobServiceClient } from '@azure/storage-blob';
import { env } from './env';

export const blobServiceClient = env.AZURE_STORAGE_CONNECTION_STRING
  ? BlobServiceClient.fromConnectionString(env.AZURE_STORAGE_CONNECTION_STRING)
  : null;

export const AZURE_STUB_MODE = !blobServiceClient;

export const getContainerClient = () => {
  if (!blobServiceClient) throw new Error('Azure Blob no configurado');
  return blobServiceClient.getContainerClient(env.AZURE_BLOB_CONTAINER);
};
