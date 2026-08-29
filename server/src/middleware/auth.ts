import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/auth.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    image?: string;
    institution?: string;
    subject?: string;
  };
  session?: any;
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session || !session.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    req.user = session.user as any;
    req.session = session.session;
    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error);
    res.status(401).json({ success: false, message: 'Invalid session or unauthorized' });
  }
};
