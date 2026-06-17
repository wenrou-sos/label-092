import { Request, Response } from 'express';
import { AppDataSource } from '../db/data-source';
import { TastingEvent, TastingStatus } from '../entities/TastingEvent';
import { TastingRegistration, RegistrationStatus } from '../entities/TastingRegistration';
import { AuthRequest } from '../middleware/auth';

const eventRepository = AppDataSource.getRepository(TastingEvent);
const registrationRepository = AppDataSource.getRepository(TastingRegistration);

export const getEvents = async (req: Request, res: Response) => {
  try {
    const { status, page = 1, pageSize = 12 } = req.query;
    const where: any = {};

    if (status) {
      where.status = status as TastingStatus;
    } else {
      where.status = 'upcoming';
    }

    const [events, total] = await eventRepository.findAndCount({
      where,
      order: { eventDate: 'ASC' },
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
    });

    res.json({
      data: events,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (error) {
    res.status(500).json({ message: '获取品鉴会列表失败', error });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = await eventRepository.findOneBy({ id: Number(id) });

    if (!event) {
      return res.status(404).json({ message: '品鉴会不存在' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: '获取品鉴会详情失败', error });
  }
};

export const registerEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = req.params;
    const { guestsCount = 1, remark } = req.body;
    const memberId = req.member!.id;

    const event = await eventRepository.findOneBy({ id: Number(eventId) });
    if (!event) {
      return res.status(404).json({ message: '品鉴会不存在' });
    }

    if (event.status !== 'upcoming') {
      return res.status(400).json({ message: '该品鉴会已结束或已取消' });
    }

    if (event.currentParticipants + guestsCount > event.maxParticipants) {
      return res.status(400).json({ message: '名额已满' });
    }

    const existing = await registrationRepository.findOneBy({
      eventId: Number(eventId),
      memberId,
    });

    if (existing && existing.status !== 'cancelled') {
      return res.status(400).json({ message: '您已报名该品鉴会' });
    }

    const registration = registrationRepository.create({
      eventId: Number(eventId),
      memberId,
      guestsCount,
      remark,
      status: 'confirmed',
    });

    await registrationRepository.save(registration);

    event.currentParticipants += guestsCount;
    await eventRepository.save(event);

    res.status(201).json({ message: '报名成功', registration });
  } catch (error) {
    res.status(500).json({ message: '报名失败', error });
  }
};

export const getMyRegistrations = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;

    const [registrations, total] = await registrationRepository.findAndCount({
      where: { memberId: req.member!.id },
      relations: ['event'],
      order: { createdAt: 'DESC' },
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
    });

    res.json({
      data: registrations,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (error) {
    res.status(500).json({ message: '获取报名记录失败', error });
  }
};

export const cancelRegistration = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const registration = await registrationRepository.findOne({
      where: { id: Number(id), memberId: req.member!.id },
      relations: ['event'],
    });

    if (!registration) {
      return res.status(404).json({ message: '报名记录不存在' });
    }

    if (registration.status === 'cancelled') {
      return res.status(400).json({ message: '该报名已取消' });
    }

    registration.status = 'cancelled';
    await registrationRepository.save(registration);

    if (registration.event) {
      registration.event.currentParticipants -= registration.guestsCount;
      await eventRepository.save(registration.event);
    }

    res.json({ message: '取消成功' });
  } catch (error) {
    res.status(500).json({ message: '取消失败', error });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const event = eventRepository.create(req.body);
    await eventRepository.save(event);
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: '创建品鉴会失败', error });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = await eventRepository.findOneBy({ id: Number(id) });

    if (!event) {
      return res.status(404).json({ message: '品鉴会不存在' });
    }

    eventRepository.merge(event, req.body);
    await eventRepository.save(event);
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: '更新品鉴会失败', error });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await eventRepository.delete(id);
    if (result.affected === 0) {
      return res.status(404).json({ message: '品鉴会不存在' });
    }
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ message: '删除品鉴会失败', error });
  }
};

export const getEventRegistrations = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const { page = 1, pageSize = 20 } = req.query;

    const [registrations, total] = await registrationRepository.findAndCount({
      where: { eventId: Number(eventId) },
      relations: ['member'],
      order: { createdAt: 'DESC' },
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
    });

    res.json({
      data: registrations,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (error) {
    res.status(500).json({ message: '获取报名列表失败', error });
  }
};
