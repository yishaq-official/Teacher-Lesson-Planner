import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getProfile, updateProfile, toggleBookmark, getBookmarkedResources } from '../controllers/userController.js';

const router = Router();

router.use(requireAuth);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/bookmarks', getBookmarkedResources);
router.post('/bookmarks/:resourceId', toggleBookmark);

export default router;
