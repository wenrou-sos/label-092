import { Request, Response } from 'express';
import { AppDataSource } from '../db/data-source';
import { Review } from '../entities/Review';
import { AuthRequest } from '../middleware/auth';

const reviewRepository = AppDataSource.getRepository(Review);

export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, rating, content, images } = req.body;
    const memberId = req.member!.id;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: '评分必须在1-5之间' });
    }

    const review = reviewRepository.create({
      productId: Number(productId),
      memberId,
      rating: Number(rating),
      content,
      images,
    });

    await reviewRepository.save(review);

    res.status(201).json({ message: '评价成功', review });
  } catch (error) {
    res.status(500).json({ message: '评价失败', error });
  }
};

export const getMyReviews = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;

    const [reviews, total] = await reviewRepository.findAndCount({
      where: { memberId: req.member!.id },
      relations: ['product'],
      order: { createdAt: 'DESC' },
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
    });

    res.json({
      data: reviews,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (error) {
    res.status(500).json({ message: '获取评价列表失败', error });
  }
};
