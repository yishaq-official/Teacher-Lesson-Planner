import multer from 'multer';

// Use memory storage so we can stream directly to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const isPdfMime = file.mimetype === 'application/pdf';
  const isPdfExt = file.originalname.toLowerCase().endsWith('.pdf');

  if (isPdfMime || isPdfExt) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF documents (.pdf) can be uploaded as teaching resources.'));
  }
};

export const uploadSingleFile = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB file size limit
  fileFilter,
}).single('file');
