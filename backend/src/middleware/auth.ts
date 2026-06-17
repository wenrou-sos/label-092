import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tea_platform_secret_key_2024';

export interface AuthRequest extends Request {
  member?: {
    id: number;
    phone: string;
    level: string;
  };
  admin?: {
    id: number;
    username: string;
  };
}

export const authenticateMember = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: '未提供认证令牌' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.type !== 'member') {
      return res.status(403).json({ message: '无权访问' });
    }
    req.member = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: '认证令牌无效' });
  }
};

export const authenticateAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: '未提供认证令牌' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.type !== 'admin') {
      return res.status(403).json({ message: '无权访问' });
    }
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: '认证令牌无效' });
  }
};

export const generateToken = (payload: object | string, expiresIn: string = '7d') => {
  return jwt.sign(payload as object, JWT_SECRET as jwt.Secret, { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] });
};
