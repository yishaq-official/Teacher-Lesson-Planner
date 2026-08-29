import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Timetable } from '../models/Timetable.js';

// GET /api/timetable - Get teacher's weekly class schedule
export const getTimetable = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const teacherId = req.user?.id;
    let timetable = await Timetable.findOne({ teacherId });

    if (!timetable) {
      // Provide default timetable template with sample periods/classes
      timetable = await Timetable.create({
        teacherId,
        slots: [
          { day: 'Monday', period: 'Period 1 (08:30 - 09:15)', className: 'Grade 9A', subject: 'Biology' },
          { day: 'Monday', period: 'Period 2 (09:20 - 10:05)', className: 'Grade 10B', subject: 'Biology' },
          { day: 'Tuesday', period: 'Period 1 (08:30 - 09:15)', className: 'Grade 9B', subject: 'Biology' },
          { day: 'Wednesday', period: 'Period 3 (10:15 - 11:00)', className: 'Grade 11A', subject: 'Biology' },
          { day: 'Thursday', period: 'Period 2 (09:20 - 10:05)', className: 'Grade 9A', subject: 'Biology' },
          { day: 'Friday', period: 'Period 4 (11:45 - 12:30)', className: 'Grade 10A', subject: 'Biology' },
        ],
      });
    }

    res.json({ success: true, timetable });
  } catch (error) {
    console.error('[getTimetable Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch timetable' });
  }
};

// PUT /api/timetable - Save or replace entire weekly class timetable
export const updateTimetable = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const teacherId = req.user?.id;
    const { slots } = req.body;

    if (!Array.isArray(slots)) {
      res.status(400).json({ success: false, message: 'Slots must be an array' });
      return;
    }

    const timetable = await Timetable.findOneAndUpdate(
      { teacherId },
      { slots },
      { new: true, upsert: true }
    );

    res.json({ success: true, message: 'Timetable updated successfully', timetable });
  } catch (error) {
    console.error('[updateTimetable Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to update timetable' });
  }
};

// POST /api/timetable/slot - Add or update single period class slot
export const setSlot = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const teacherId = req.user?.id;
    const { day, period, className, subject, room } = req.body;

    if (!day || !period || !className) {
      res.status(400).json({ success: false, message: 'Day, period, and className are required' });
      return;
    }

    let timetable = await Timetable.findOne({ teacherId });
    if (!timetable) {
      timetable = new Timetable({ teacherId, slots: [] });
    }

    // Remove existing slot for this day & period if present
    timetable.slots = timetable.slots.filter(
      (s: any) => !(s.day === day && s.period.startsWith(period.slice(0, 8)))
    );

    // If className is non-empty, add the new slot
    if (className.trim().length > 0) {
      timetable.slots.push({
        day,
        period,
        className: className.trim(),
        subject: subject || '',
        room: room || '',
      });
    }

    await timetable.save();
    res.json({ success: true, message: 'Slot updated successfully', timetable });
  } catch (error) {
    console.error('[setSlot Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to update slot' });
  }
};
