import multer from 'multer';
import { BadRequestError } from '../shared/utils/errors';

export const uploadFoto = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new BadRequestError('Formato no permitido. Use JPG, PNG o WebP.'));
    }
    cb(null, true);
  },
});
