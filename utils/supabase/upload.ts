import { createClient } from './client';

/**
 * Uploads a file to a Supabase storage bucket and returns the public URL.
 * @param file The file object to upload.
 * @param bucket The name of the storage bucket.
 * @param folder Optional folder path within the bucket.
 */
export async function uploadFile(
  file: File,
  bucket: string = 'article-covers',
  folder: string = 'covers'
): Promise<string> {
  const supabase = createClient();
  
  // Generate a unique filename: timestamp-name-random
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = folder ? `${folder}/${fileName}` : fileName;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return data.publicUrl;
}
