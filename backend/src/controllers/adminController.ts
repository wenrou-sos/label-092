import { Request, Response } from 'express';
import { AppDataSource } from '../db/data-source';
import { Admin } from '../entities/Admin';
import { AuthRequest, generateToken } from '../middleware/auth';
import bcrypt from 'bcryptjs';

const adminRepository = AppDataSource.getRepository(Admin);

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const admin = await adminRepository.findOneBy({ username });
    if (!admin) {
      return res.status(404).json({ message: '管理员不存在' });
    }

    if (!admin.isActive) {
      return res.status(403).json({ message: '账号已被禁用' });
    }

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return res.status(401).json({ message: '密码错误' });
    }

    const token = generateToken({
      id: admin.id,
      username: admin.username,
      type: 'admin',
    });

    res.json({
      message: '登录成功',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
      },
    });
  } catch (error) {
    res.status(500).json({ message: '登录失败', error });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const admin = await adminRepository.findOneBy({ id: req.admin!.id });
    if (!admin) {
      return res.status(404).json({ message: '管理员不存在' });
    }

    res.json({
      id: admin.id,
      username: admin.username,
      name: admin.name,
    });
  } catch (error) {
    res.status(500).json({ message: '获取信息失败', error });
  }
};

export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '请选择要上传的图片' });
    }

    const type = req.params.type || 'products';
    const imageUrl = `/uploads/${type}/${req.file.filename}`;

    res.json({
      message: '上传成功',
      url: imageUrl,
      filename: req.file.filename,
    });
  } catch (error) {
    res.status(500).json({ message: '上传失败', error });
  }
};
