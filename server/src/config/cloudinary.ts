import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || '1234567890',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'abcdefghijklmnopqrstuvwxyz',
});

export const uploadToCloudinary = (
  fileBuffer: Buffer,
  filename: string,
  folder: string = 'teacher_resources'
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    // If Cloudinary credentials are default/demo, save file locally into uploads/ directory
    if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'demo') {
      try {
        const uploadsDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const safeFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = path.join(uploadsDir, safeFilename);

        fs.writeFileSync(filePath, fileBuffer);

        const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
        const localUrl = `${serverUrl}/uploads/${safeFilename}`;

        return resolve({
          url: localUrl,
          publicId: `local/${safeFilename}`,
        });
      } catch (err) {
        return reject(err || new Error('Failed to save file locally'));
      }
    }

    // Cloudinary real upload stream
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        public_id: `${Date.now()}-${filename.replace(/\.[^/.]+$/, '')}`,
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Cloudinary upload failed'));
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'demo') {
    if (publicId.startsWith('local/')) {
      const filename = publicId.replace('local/', '');
      const filePath = path.join(process.cwd(), 'uploads', filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.warn(`[Local Uploads] Failed to delete file ${filePath}:`, err);
        }
      }
    }
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn(`[Cloudinary] Failed to delete asset ${publicId}:`, err);
  }
};

export default cloudinary;
