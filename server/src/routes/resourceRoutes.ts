import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { uploadSingleFile } from '../middleware/upload.js';
import {
  getResources,
  getResourceById,
  uploadResource,
  updateResource,
  deleteResource,
  downloadResource,
  toggleResourceVisibility,
} from '../controllers/resourceController.js';

const router = Router();

router.use(requireAuth);

router.get('/', getResources);
router.post('/', uploadSingleFile, uploadResource);
router.get('/:id', getResourceById);
router.patch('/:id', uploadSingleFile, updateResource);
router.patch('/:id/visibility', toggleResourceVisibility);
router.delete('/:id', deleteResource);
router.post('/:id/download', downloadResource);

export default router;
