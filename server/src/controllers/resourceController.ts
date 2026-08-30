import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Resource } from '../models/Resource.js';
import { LessonPlan } from '../models/LessonPlan.js';
import { User } from '../models/User.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import mongoose from 'mongoose';

// GET /api/resources - Search and browse public resources
export const getResources = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { q, subject, grade, type, myResources } = req.query;

    const filter: any = {};

    if (myResources === 'true') {
      filter.teacherId = req.user?.id;
    } else {
      // Community Hub: Show public resources (isPublic !== false) or resources created by the current user
      filter.$or = [{ isPublic: true }, { isPublic: { $ne: false } }, { teacherId: req.user?.id }];
    }

    if (subject) {
      filter.subject = subject;
    }
    if (grade) {
      filter.grade = grade;
    }
    if (type) {
      filter.type = type;
    }

    if (q && typeof q === 'string' && q.trim().length > 0) {
      const regex = new RegExp(q.trim(), 'i');
      const searchConditions = [
        { title: regex },
        { topic: regex },
        { description: regex },
        { tags: regex },
      ];

      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchConditions }];
        delete filter.$or;
      } else {
        filter.$or = searchConditions;
      }
    }

    const resources = await Resource.find(filter)
      .populate('teacherId', 'name institution email image')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: resources.length, resources });
  } catch (error) {
    console.error('[getResources Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve resources' });
  }
};

// GET /api/resources/:id - Get single resource details
export const getResourceById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid resource ID' });
      return;
    }

    const resource = await Resource.findById(id).populate('teacherId', 'name institution email image');
    if (!resource) {
      res.status(404).json({ success: false, message: 'Resource not found' });
      return;
    }

    res.json({ success: true, resource });
  } catch (error) {
    console.error('[getResourceById Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch resource' });
  }
};

// POST /api/resources - Upload new teaching resource
export const uploadResource = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const file = req.file;
    const { title, description, subject, grade, topic, type, tags, isPublic } = req.body;

    if (!file) {
      res.status(400).json({ success: false, message: 'Please upload a resource file' });
      return;
    }

    if (!title || !subject || !grade || !topic || !type) {
      res.status(400).json({
        success: false,
        message: 'Missing required metadata: title, subject, grade, topic, and type are required.',
      });
      return;
    }

    // Upload to Cloudinary / storage
    const uploadResult = await uploadToCloudinary(file.buffer, file.originalname);

    const parsedTags = typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : (Array.isArray(tags) ? tags : []);
    const isPublicBool = isPublic === 'false' || isPublic === false ? false : true;

    if (req.user) {
      const userFilter = req.user.email ? { email: req.user.email } : { _id: req.user.id };
      await User.findOneAndUpdate(
        userFilter,
        {
          $setOnInsert: {
            _id: req.user.id,
          },
          $set: {
            name: req.user.name || 'Teacher User',
            email: req.user.email || '',
            institution: req.user.institution || '',
            subject: req.user.subject || '',
          },
        },
        { upsert: true, new: true }
      );
    }

    const resource = await Resource.create({
      teacherId: req.user?.id,
      title,
      description: description || '',
      subject,
      grade,
      topic,
      type,
      tags: parsedTags,
      fileUrl: uploadResult.url,
      publicId: uploadResult.publicId,
      fileType: file.mimetype,
      fileSize: file.size,
      isPublic: isPublicBool,
    });

    const populated = await resource.populate('teacherId', 'name institution email image');

    res.status(201).json({
      success: true,
      message: 'Resource uploaded successfully',
      resource: populated,
    });
  } catch (error: any) {
    console.error('[uploadResource Error]:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to upload resource' });
  }
};

// PATCH /api/resources/:id/visibility - Toggle public/private visibility (Owner only)
export const toggleResourceVisibility = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid resource ID' });
      return;
    }

    const resource = await Resource.findById(id);
    if (!resource) {
      res.status(404).json({ success: false, message: 'Resource not found' });
      return;
    }

    if (String(resource.teacherId) !== String(req.user?.id)) {
      res.status(403).json({ success: false, message: 'Unauthorized: Only the creator can modify resource visibility.' });
      return;
    }

    const newIsPublic = req.body.isPublic !== undefined ? Boolean(req.body.isPublic) : !resource.isPublic;
    resource.isPublic = newIsPublic;
    await resource.save();

    const populated = await resource.populate('teacherId', 'name institution email image');

    res.json({
      success: true,
      message: `Resource is now ${newIsPublic ? 'Public (Shared)' : 'Private (Only you)'}`,
      resource: populated,
    });
  } catch (error) {
    console.error('[toggleResourceVisibility Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to update resource visibility' });
  }
};

// DELETE /api/resources/:id - Delete resource (Owner only)
export const deleteResource = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid resource ID' });
      return;
    }

    const resource = await Resource.findById(id);
    if (!resource) {
      res.status(404).json({ success: false, message: 'Resource not found' });
      return;
    }

    if (String(resource.teacherId) !== String(req.user?.id)) {
      res.status(403).json({ success: false, message: 'Unauthorized: Only the creator can delete this resource.' });
      return;
    }

    // Delete Cloudinary asset
    if (resource.publicId) {
      await deleteFromCloudinary(resource.publicId);
    }

    // Pull resource reference from any LessonPlan that attached it
    await LessonPlan.updateMany({ resources: id }, { $pull: { resources: id } });

    await Resource.deleteOne({ _id: id });

    res.json({ success: true, message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('[deleteResource Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to delete resource' });
  }
};

// POST /api/resources/:id/download - Increment download count & download file
export const downloadResource = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid resource ID' });
      return;
    }

    const resource = await Resource.findByIdAndUpdate(
      id,
      { $inc: { downloadsCount: 1 } },
      { new: true }
    );

    if (!resource) {
      res.status(404).json({ success: false, message: 'Resource not found' });
      return;
    }

    res.json({
      success: true,
      fileUrl: resource.fileUrl,
      title: resource.title,
      downloadsCount: resource.downloadsCount,
    });
  } catch (error) {
    console.error('[downloadResource Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to process resource download' });
  }
};
