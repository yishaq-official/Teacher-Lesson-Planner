import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  duplicateLesson,
  toggleLessonStatus,
} from '../controllers/lessonController.js';

const router = Router();

router.use(requireAuth);

router.get('/', getLessons);
router.post('/', createLesson);
router.get('/:id', getLessonById);
router.put('/:id', updateLesson);
router.delete('/:id', deleteLesson);
router.post('/:id/duplicate', duplicateLesson);
router.patch('/:id/status', toggleLessonStatus);

export default router;
