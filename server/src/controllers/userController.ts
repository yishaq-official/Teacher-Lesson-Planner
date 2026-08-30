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

    // Fallback: If user doc missing by ID, lookup by email first to prevent duplicate key creation
    if (!user && req.user?.email) {
      user = await User.findOne({ email: req.user.email });
    }

    if (!user) {
      user = await User.create({
        _id: userId,
        name: req.user?.name || 'Teacher User',
        email: req.user?.email || '',
        institution: req.user?.institution || '',
        subject: req.user?.subject || '',
      });
    }

    const myLessons = await LessonPlan.find({ teacherId: userId }).sort({ date: -1 });
    const myResources = await Resource.find({ teacherId: userId }).populate('teacherId', 'name subject email image').sort({ createdAt: -1 });

    const totalLessons = myLessons.length;
    const totalResources = myResources.length;
    const totalDownloads = myResources.reduce((acc, r) => acc + (r.downloadsCount || 0), 0);

    res.json({
      success: true,
      user,
      resources: myResources,
      lessons: myLessons,
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

    if (name && typeof name === 'string' && name.trim().length > 0) {
      const trimmedName = name.trim();
      const existingUser = await User.findOne({
        _id: { $ne: userId },
        name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
      });

      if (existingUser) {
        res.status(400).json({
          success: false,
          message: `The username "${trimmedName}" is already taken by another teacher. Please choose a unique username.`,
        });
        return;
      }
    }

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

// POST /api/user/bookmarks/:resourceId - Toggle save/bookmark resource
export const toggleBookmark = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { resourceId } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const saved = user.savedResources || [];
    const existsIndex = saved.findIndex((id: string) => String(id) === String(resourceId));

    let isBookmarked = false;
    if (existsIndex > -1) {
      saved.splice(existsIndex, 1);
      isBookmarked = false;
    } else {
      saved.push(resourceId);
      isBookmarked = true;
    }

    user.savedResources = saved;
    await user.save();

    res.json({
      success: true,
      isBookmarked,
      savedResources: user.savedResources,
      message: isBookmarked ? 'Resource saved to your bookmarks' : 'Resource removed from bookmarks',
    });
  } catch (error) {
    console.error('[toggleBookmark Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to update bookmark' });
  }
};

// GET /api/user/bookmarks - Get bookmarked resources
export const getBookmarkedResources = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId).populate({
      path: 'savedResources',
      populate: { path: 'teacherId', select: 'name institution email image' },
    });

    res.json({
      success: true,
      resources: user?.savedResources || [],
    });
  } catch (error) {
    console.error('[getBookmarkedResources Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve saved resources' });
  }
};
