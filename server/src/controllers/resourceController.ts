import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Resource } from '../models/Resource.js';
import { LessonPlan } from '../models/LessonPlan.js';
import { User } from '../models/User.js';
import { uploadToCloudinary, deleteFromCloudinary, hasValidCloudinaryConfig } from '../config/cloudinary.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const upgradeLocalResourceIfNeeded = async (resource: any) => {
  if (!resource) return resource;
  if (!hasValidCloudinaryConfig()) return resource;

  const isLocalResource =
    String(resource.publicId || '').startsWith('local/') || String(resource.fileUrl || '').includes('/uploads/');

  if (!isLocalResource) return resource;

  const existingPath = String(resource.publicId || '').startsWith('local/')
    ? String(resource.publicId).replace('local/', '')
    : String(resource.fileUrl || '').includes('/uploads/')
      ? String(resource.fileUrl).split('/uploads/')[1]
      : '';

  if (!existingPath) return resource;

  const filePath = path.join(process.cwd(), 'uploads', existingPath);
  if (!fs.existsSync(filePath)) return resource;

  const fileBuffer = fs.readFileSync(filePath);
  const uploadResult = await uploadToCloudinary(fileBuffer, path.basename(filePath));

  resource.fileUrl = uploadResult.url;
  resource.publicId = uploadResult.publicId;
  await resource.save();
  return resource;
};

// GET /api/resources - Search and browse public resources
export const getResources = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { q, subject, grade, type, myResources } = req.query;

    const filter: any = {};

    if (myResources === 'true') {
      filter.teacherId = req.user?.id;
    } else {
      // Community Hub: show public resources from other teachers only
      filter.teacherId = { $ne: req.user?.id };
      filter.$or = [{ isPublic: true }, { isPublic: { $ne: false } }];
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

    await Promise.all(resources.map((resource) => upgradeLocalResourceIfNeeded(resource)));

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

    await upgradeLocalResourceIfNeeded(resource);

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

// PATCH /api/resources/:id - Update resource metadata and optionally replace file
export const updateResource = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
      res.status(403).json({ success: false, message: 'Unauthorized: Only the creator can edit this resource.' });
      return;
    }

    const file = req.file;
    const { title, description, subject, grade, topic, type, tags, isPublic } = req.body;

    let updatedFileUrl = resource.fileUrl;
    let updatedPublicId = resource.publicId;
    let updatedFileType = resource.fileType;
    let updatedFileSize = resource.fileSize;

    if (file) {
      const uploadResult = await uploadToCloudinary(file.buffer, file.originalname);
      updatedFileUrl = uploadResult.url;
      updatedPublicId = uploadResult.publicId;
      updatedFileType = file.mimetype;
      updatedFileSize = file.size;

      if (resource.publicId) {
        await deleteFromCloudinary(resource.publicId);
      }
    }

    if (title !== undefined) resource.title = title;
    if (description !== undefined) resource.description = description || '';
    if (subject !== undefined) resource.subject = subject;
    if (grade !== undefined) resource.grade = grade;
    if (topic !== undefined) resource.topic = topic;
    if (type !== undefined) resource.type = type;
    if (tags !== undefined) {
      resource.tags =
        typeof tags === 'string'
          ? tags.split(',').map((t) => t.trim()).filter(Boolean)
          : Array.isArray(tags)
            ? tags
            : resource.tags;
    }
    if (isPublic !== undefined) {
      resource.isPublic = isPublic === 'false' || isPublic === false ? false : true;
    }

    resource.fileUrl = updatedFileUrl;
    resource.publicId = updatedPublicId;
    resource.fileType = updatedFileType;
    resource.fileSize = updatedFileSize;

    await resource.save();
    const populated = await resource.populate('teacherId', 'name institution email image');

    res.json({
      success: true,
      message: 'Resource updated successfully',
      resource: populated,
    });
  } catch (error: any) {
    console.error('[updateResource Error]:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update resource' });
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

    await upgradeLocalResourceIfNeeded(resource);

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
