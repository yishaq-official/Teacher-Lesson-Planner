import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Resource } from '../models/Resource.js';
import { LessonPlan } from '../models/LessonPlan.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import mongoose from 'mongoose';

// GET /api/resources - Search and browse public resources
export const getResources = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { q, subject, grade, type, myResources } = req.query;

    const filter: any = {};

    if (myResources === 'true') {
      filter.teacherId = req.user?.id;
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
      filter.$text = { $search: q.trim() };
    }

    const resources = await Resource.find(filter)
      .populate('teacherId', 'name institution email')
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

    const resource = await Resource.findById(id).populate('teacherId', 'name institution email');
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
    const { title, description, subject, grade, topic, type, tags } = req.body;

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
    });

    const populated = await resource.populate('teacherId', 'name institution email');

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

// DELETE /api/resources/:id - Delete resource (Owner only)
export const deleteResource = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid resource ID' });
      return;
    }

    const resource = await Resource.findOne({ _id: id, teacherId: req.user?.id });
    if (!resource) {
      res.status(404).json({ success: false, message: 'Resource not found or unauthorized' });
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
