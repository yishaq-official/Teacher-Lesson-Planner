import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { LessonPlan } from '../models/LessonPlan.js';
import { Resource } from '../models/Resource.js';
import { User } from '../models/User.js';

// GET /api/dashboard/stats
export const getDashboardSummary = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const teacherId = req.user?.id;

    const totalLessons = await LessonPlan.countDocuments({ teacherId });
    const upcomingCount = await LessonPlan.countDocuments({ teacherId, status: 'upcoming' });
    const completedCount = await LessonPlan.countDocuments({ teacherId, status: 'completed' });
    const myResourcesCount = await Resource.countDocuments({ teacherId });

    // Recent upcoming lessons for teacher
    const upcomingLessons = await LessonPlan.find({ teacherId, status: 'upcoming' })
      .populate('resources', 'title fileUrl type')
      .sort({ date: 1 })
      .limit(4);

    // Recent resources in the hub (Public resources or owned by current teacher) - 3 samples for dashboard
    const recentResources = await Resource.find({
      $or: [{ isPublic: true }, { isPublic: { $ne: false } }, { teacherId }],
    })
      .populate('teacherId', 'name institution email image')
      .sort({ createdAt: -1 })
      .limit(3);

    res.json({
      success: true,
      stats: {
        totalLessons,
        upcomingCount,
        completedCount,
        myResourcesCount,
      },
      upcomingLessons,
      recentResources,
    });
  } catch (error) {
    console.error('[getDashboardSummary Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve dashboard statistics' });
  }
};
