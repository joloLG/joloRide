import { supabase } from './supabase';

export interface UploadResult {
  url: string;
  error?: string;
}

export class ImageUploader {
  static async uploadImage(
    file: File, 
    bucket: 'products' | 'stores' | 'hero',
    fileName?: string
  ): Promise<UploadResult> {
    try {
      // Generate unique file name if not provided
      const finalFileName = fileName || `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
      
      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(finalFileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Upload error:', error);
        return { url: '', error: error.message };
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return { url: publicUrl };
    } catch (error) {
      console.error('Upload failed:', error);
      return { url: '', error: 'Upload failed' };
    }
  }

  static async deleteImage(
    path: string, 
    bucket: 'products' | 'stores' | 'hero'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Delete failed:', error);
      return { success: false, error: 'Delete failed' };
    }
  }

  static validateImageFile(file: File): { valid: boolean; error: string } {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: 'Invalid file type. Please upload JPEG, PNG, GIF, or WebP images.' 
      };
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: 'File too large. Please upload images smaller than 5MB.' 
      };
    }

    return { valid: true, error: '' };
  }

  static getImageUrlFromPath(path: string, bucket: 'products' | 'stores' | 'hero'): string {
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return publicUrl;
  }

  static extractPathFromUrl(url: string): string {
    // Extract path from Supabase storage URL
    // Example: https://xxx.supabase.co/storage/v1/object/public/bucket/path/to/file.jpg
    // Returns: path/to/file.jpg
    
    const match = url.match(/\/storage\/v1\/object\/public\/[^\/]+\/(.+)/);
    return match ? match[1] : '';
  }
}
