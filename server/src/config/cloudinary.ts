import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

export const uploadToCloudinary = (
  fileBuffer: Buffer,
  filename: string,
  folder: string = 'teacher_resources'
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    const ext = path.extname(filename).toLowerCase();
    const isPdf = ext === '.pdf';

    // Helper to save locally in server/uploads/
    const saveLocally = () => {
      try {
        console.log(`[Local Upload]: Saving '${filename}' to server/uploads directory.`);
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
    };

    // Note: Cloudinary free/new accounts restrict PDF delivery (401 x-cld-error: deny or ACL failure).
    // PDFs are served directly & reliably via local storage with inline PDF headers.
    if (isPdf) {
      console.log(`[PDF Handler]: Serving PDF '${filename}' locally for reliable inline browser viewing.`);
      return saveLocally();
    }

    // Check if real Cloudinary keys are configured
    const hasValidCloudinary =
      cloudName &&
      cloudName !== 'demo' &&
      apiKey &&
      apiKey !== '1234567890' &&
      apiSecret &&
      apiSecret !== 'abcdefghijklmnopqrstuvwxyz';

    if (!hasValidCloudinary) {
      return saveLocally();
    }

    // Configure Cloudinary with active environment credentials
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    console.log(`[Cloudinary Uploading]: File '${filename}' (${fileBuffer.length} bytes) to Cloud '${cloudName}'`);

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        public_id: `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
      },
      (error, result) => {
        if (error || !result) {
          console.error('[Cloudinary Stream Error]:', error);
          return saveLocally();
        }

        console.log(`[Cloudinary Upload Success]: Saved to ${result.secure_url}`);
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
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  const hasValidCloudinary =
    cloudName &&
    cloudName !== 'demo' &&
    apiKey &&
    apiKey !== '1234567890' &&
    apiSecret;

  if (!hasValidCloudinary || publicId.startsWith('local/')) {
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
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    await cloudinary.uploader.destroy(publicId, { resource_type: 'auto' });
    console.log(`[Cloudinary Deleted]: ${publicId}`);
  } catch (err) {
    console.warn(`[Cloudinary] Failed to delete asset ${publicId}:`, err);
  }
};

export default cloudinary;
