import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getTimetable, updateTimetable, setSlot } from '../controllers/timetableController.js';

const router = Router();

router.use(requireAuth);

router.get('/', getTimetable);
router.put('/', updateTimetable);
router.post('/slot', setSlot);

export default router;
