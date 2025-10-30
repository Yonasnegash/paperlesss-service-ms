// middlewares/roleMiddleware.ts
import { Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
    user: any
}

export const accessControl = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user as { roleId?: string }; // Extract roleId from the token

    if (!user || !user.roleId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!allowedRoles.includes(user.roleId)) {
      return res.status(403).json({ message: 'Forbidden: Action not allowed' });
    }

    next();
  };
};
