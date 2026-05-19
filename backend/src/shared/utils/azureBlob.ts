import { AZURE_STUB_MODE, getContainerClient } from '../../config/azureBlob';

/**
 * Sube un archivo al container de Azure Blob.
 * Modo stub si AZURE_STORAGE_CONNECTION_STRING no está configurada.
 *
 * @returns URL pública del blob
 */
export async function uploadFile(
  buffer: Buffer,
  filename: string,
  contentType: string,
): Promise<string> {
  if (AZURE_STUB_MODE) {
    console.warn(`[AZURE STUB] uploadFile: ${filename}`);
    return `https://stub.local/${filename}`;
  }

  const containerClient = getContainerClient();
  const blockBlobClient = containerClient.getBlockBlobClient(filename);

  await blockBlobClient.upload(buffer, buffer.length, {
    blobHTTPHeaders: { blobContentType: contentType },
  });

  return blockBlobClient.url;
}

/**
 * Borra un blob por su nombre relativo dentro del container.
 */
export async function deleteFile(blobName: string): Promise<void> {
  if (AZURE_STUB_MODE) {
    console.warn(`[AZURE STUB] deleteFile: ${blobName}`);
    return;
  }

  const containerClient = getContainerClient();
  await containerClient.deleteBlob(blobName, { deleteSnapshots: 'include' });
}

/**
 * Extrae el nombre del blob desde una URL completa de Azure Blob Storage.
 * Ejemplo: https://account.blob.core.windows.net/container/folder/file.jpg
 * → folder/file.jpg
 */
export function extractBlobName(url: string): string {
  // Stub URLs: https://stub.local/folder/file.jpg → folder/file.jpg
  if (url.startsWith('https://stub.local/')) {
    return url.replace('https://stub.local/', '');
  }

  // Azure URLs: https://<account>.blob.core.windows.net/<container>/<blobName>
  try {
    const parsed = new URL(url);
    // pathname = /<container>/<blobName...>
    const parts = parsed.pathname.split('/').filter(Boolean);
    // parts[0] = container, rest = blobName
    return parts.slice(1).join('/');
  } catch {
    return url;
  }
}
