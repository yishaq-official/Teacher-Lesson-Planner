import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { LessonPlan } from '../models/LessonPlan.js';
import { Resource } from '../models/Resource.js';

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    let user = await User.findById(userId);

    // Fallback: If user doc missing, build default from session
    if (!user) {
      user = await User.create({
        _id: userId,
        name: req.user?.name || 'Teacher User',
        email: req.user?.email || '',
        institution: req.user?.institution || '',
        subject: req.user?.subject || '',
      });
    }

    const totalLessons = await LessonPlan.countDocuments({ teacherId: userId });
    const totalResources = await Resource.countDocuments({ teacherId: userId });

    const resources = await Resource.find({ teacherId: userId }).select('downloadsCount');
    const totalDownloads = resources.reduce((acc, r) => acc + (r.downloadsCount || 0), 0);

    res.json({
      success: true,
      user,
      stats: {
        totalLessons,
        totalResources,
        totalDownloads,
      },
    });
  } catch (error: any) {
    console.error('[getProfile Error]:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch user profile' });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { name, institution, subject, grade, bio, phone, location, yearsOfExperience, image } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          name: name ?? req.user?.name,
          institution: institution ?? '',
          subject: subject ?? '',
          grade: grade ?? '',
          bio: bio ?? '',
          phone: phone ?? '',
          location: location ?? '',
          yearsOfExperience: yearsOfExperience ?? '',
          image: image ?? req.user?.image,
        },
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      user: updatedUser,
      message: 'Profile updated successfully',
    });
  } catch (error: any) {
    console.error('[updateProfile Error]:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update user profile' });
  }
};
