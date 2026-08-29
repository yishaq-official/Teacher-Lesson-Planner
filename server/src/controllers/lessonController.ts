import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { LessonPlan } from '../models/LessonPlan.js';
import { User } from '../models/User.js';
import mongoose from 'mongoose';

// GET /api/lessons - Get all lessons for authenticated teacher
export const getLessons = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const teacherId = req.user?.id;
    const { status, subject, grade, search } = req.query;

    const filter: any = { teacherId };

    if (status && (status === 'upcoming' || status === 'completed')) {
      filter.status = status;
    }
    if (subject) {
      filter.subject = subject;
    }
    if (grade) {
      filter.grade = grade;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } },
      ];
    }

    const lessons = await LessonPlan.find(filter)
      .populate('resources', 'title type fileUrl subject grade')
      .sort({ date: 1, createdAt: -1 });

    res.json({ success: true, count: lessons.length, lessons });
  } catch (error) {
    console.error('[getLessons Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve lesson plans' });
  }
};

// GET /api/lessons/:id - Get single lesson details
export const getLessonById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid lesson ID format' });
      return;
    }

    const lesson = await LessonPlan.findOne({ _id: id, teacherId: req.user?.id }).populate(
      'resources'
    );

    if (!lesson) {
      res.status(404).json({ success: false, message: 'Lesson plan not found' });
      return;
    }

    res.json({ success: true, lesson });
  } catch (error) {
    console.error('[getLessonById Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch lesson details' });
  }
};

// POST /api/lessons - Create new lesson plan
export const createLesson = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      subject,
      grade,
      topic,
      date,
      duration,
      objectives,
      introduction,
      mainActivity,
      practiceActivity,
      conclusion,
      homework,
      teacherNotes,
      resources,
    } = req.body;

    if (!title || !subject || !grade || !topic || !date) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: title, subject, grade, topic, and date are required.',
      });
      return;
    }

    const lesson = await LessonPlan.create({
      teacherId: req.user?.id,
      title,
      subject,
      grade,
      topic,
      date: new Date(date),
      duration: duration ? Number(duration) : 45,
      objectives: Array.isArray(objectives) ? objectives : [],
      introduction: introduction || '',
      mainActivity: mainActivity || '',
      practiceActivity: practiceActivity || '',
      conclusion: conclusion || '',
      homework: homework || '',
      teacherNotes: teacherNotes || '',
      resources: Array.isArray(resources) ? resources : [],
    });

    const populated = await lesson.populate('resources');

    res.status(201).json({ success: true, message: 'Lesson plan created', lesson: populated });
  } catch (error) {
    console.error('[createLesson Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to create lesson plan' });
  }
};

// PUT /api/lessons/:id - Update existing lesson plan
export const updateLesson = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid lesson ID format' });
      return;
    }

    const lesson = await LessonPlan.findOne({ _id: id, teacherId: req.user?.id });
    if (!lesson) {
      res.status(404).json({ success: false, message: 'Lesson plan not found or unauthorized' });
      return;
    }

    const fieldsToUpdate = [
      'title',
      'subject',
      'grade',
      'topic',
      'date',
      'duration',
      'objectives',
      'introduction',
      'mainActivity',
      'practiceActivity',
      'conclusion',
      'homework',
      'teacherNotes',
      'status',
      'resources',
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'date') {
          (lesson as any)[field] = new Date(req.body[field]);
        } else {
          (lesson as any)[field] = req.body[field];
        }
      }
    });

    await lesson.save();
    const updated = await lesson.populate('resources');

    res.json({ success: true, message: 'Lesson plan updated', lesson: updated });
  } catch (error) {
    console.error('[updateLesson Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to update lesson plan' });
  }
};

// DELETE /api/lessons/:id - Delete lesson plan
export const deleteLesson = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid lesson ID format' });
      return;
    }

    const result = await LessonPlan.deleteOne({ _id: id, teacherId: req.user?.id });
    if (result.deletedCount === 0) {
      res.status(404).json({ success: false, message: 'Lesson plan not found or unauthorized' });
      return;
    }

    res.json({ success: true, message: 'Lesson plan deleted successfully' });
  } catch (error) {
    console.error('[deleteLesson Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to delete lesson plan' });
  }
};

// POST /api/lessons/:id/duplicate - Duplicate lesson plan
export const duplicateLesson = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid lesson ID format' });
      return;
    }

    const original = await LessonPlan.findOne({ _id: id, teacherId: req.user?.id });
    if (!original) {
      res.status(404).json({ success: false, message: 'Lesson plan not found' });
      return;
    }

    const duplicated = await LessonPlan.create({
      teacherId: req.user?.id,
      title: `${original.title} (Copy)`,
      subject: original.subject,
      grade: original.grade,
      topic: original.topic,
      date: new Date(),
      duration: original.duration,
      objectives: original.objectives,
      introduction: original.introduction,
      mainActivity: original.mainActivity,
      practiceActivity: original.practiceActivity,
      conclusion: original.conclusion,
      homework: original.homework,
      teacherNotes: original.teacherNotes,
      status: 'upcoming',
      resources: original.resources,
    });

    const populated = await duplicated.populate('resources');
    res.status(201).json({ success: true, message: 'Lesson plan duplicated', lesson: populated });
  } catch (error) {
    console.error('[duplicateLesson Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to duplicate lesson plan' });
  }
};

// PATCH /api/lessons/:id/status - Toggle status (upcoming <-> completed)
export const toggleLessonStatus = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    if (!['upcoming', 'completed'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status value' });
      return;
    }

    const lesson = await LessonPlan.findOneAndUpdate(
      { _id: id, teacherId: req.user?.id },
      { status },
      { new: true }
    ).populate('resources');

    if (!lesson) {
      res.status(404).json({ success: false, message: 'Lesson plan not found' });
      return;
    }

    res.json({ success: true, message: `Lesson status updated to ${status}`, lesson });
  } catch (error) {
    console.error('[toggleLessonStatus Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to update lesson status' });
  }
};
