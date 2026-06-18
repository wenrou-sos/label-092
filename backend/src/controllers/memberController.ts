import { Request, Response } from 'express';
import { AppDataSource } from '../db/data-source';
import { Member, getMemberDiscount } from '../entities/Member';
import { AuthRequest, generateToken } from '../middleware/auth';
import bcrypt from 'bcryptjs';

const memberRepository = AppDataSource.getRepository(Member);

export const register = async (req: Request, res: Response) => {
  try {
    const { phone, name, password } = req.body;

    const existing = await memberRepository.findOneBy({ phone });
    if (existing) {
      return res.status(400).json({ message: '该手机号已注册' });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    const member = memberRepository.create({
      phone,
      name,
      password: hashedPassword,
    });

    await memberRepository.save(member);

    const token = generateToken({
      id: member.id,
      phone: member.phone,
      level: member.level,
      type: 'member',
    });

    res.status(201).json({
      message: '注册成功',
      token,
      member: {
        id: member.id,
        name: member.name,
        phone: member.phone,
        level: member.level,
        totalSpent: member.totalSpent,
        points: member.points,
      },
    });
  } catch (error) {
    res.status(500).json({ message: '注册失败', error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { phone, password } = req.body;

    const member = await memberRepository.findOneBy({ phone });
    if (!member) {
      return res.status(404).json({ message: '用户不存在' });
    }

    if (member.password) {
      const isValid = await bcrypt.compare(password, member.password);
      if (!isValid) {
        return res.status(401).json({ message: '密码错误' });
      }
    }

    const token = generateToken({
      id: member.id,
      phone: member.phone,
      level: member.level,
      type: 'member',
    });

    res.json({
      message: '登录成功',
      token,
      member: {
        id: member.id,
        name: member.name,
        phone: member.phone,
        level: member.level,
        totalSpent: member.totalSpent,
        points: member.points,
        birthday: member.birthday,
      },
    });
  } catch (error) {
    res.status(500).json({ message: '登录失败', error });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const member = await memberRepository.findOneBy({ id: req.member!.id });
    if (!member) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.json({
      id: member.id,
      name: member.name,
      phone: member.phone,
      level: member.level,
      totalSpent: member.totalSpent,
      points: member.points,
      birthday: member.birthday,
      birthdayGiftSent: member.birthdayGiftSent,
      discount: getMemberDiscount(member.level),
      nextLevel: getNextLevel(member.totalSpent),
    });
  } catch (error) {
    res.status(500).json({ message: '获取用户信息失败', error });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const member = await memberRepository.findOneBy({ id: req.member!.id });
    if (!member) {
      return res.status(404).json({ message: '用户不存在' });
    }

    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    memberRepository.merge(member, req.body);
    await memberRepository.save(member);

    res.json({
      message: '更新成功',
      member: {
        id: member.id,
        name: member.name,
        phone: member.phone,
        level: member.level,
        birthday: member.birthday,
      },
    });
  } catch (error) {
    res.status(500).json({ message: '更新失败', error });
  }
};

export const getMembers = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 20, keyword, level } = req.query;
    const where: any = {};

    if (keyword) {
      where.name = req.query.keyword;
      where.phone = req.query.keyword;
    }

    if (level) {
      where.level = level;
    }

    const [members, total] = await memberRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
    });

    res.json({
      data: members,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (error) {
    res.status(500).json({ message: '获取会员列表失败', error });
  }
};

export const getMemberById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const member = await memberRepository.findOne({
      where: { id: Number(id) },
      relations: ['orders'],
    });

    if (!member) {
      return res.status(404).json({ message: '会员不存在' });
    }

    res.json(member);
  } catch (error) {
    res.status(500).json({ message: '获取会员详情失败', error });
  }
};

function getNextLevel(totalSpent: number): { level: string; amountNeeded: number } | null {
  if (totalSpent < 1000) {
    return { level: 'silver', amountNeeded: 1000 - totalSpent };
  } else if (totalSpent < 5000) {
    return { level: 'gold', amountNeeded: 5000 - totalSpent };
  } else if (totalSpent < 10000) {
    return { level: 'diamond', amountNeeded: 10000 - totalSpent };
  }
  return null;
}
