import { Request, Response } from 'express';
import { AppDataSource } from '../db/data-source';
import { Product, TeaCategory } from '../entities/Product';
import { Review } from '../entities/Review';
import { ILike, LessThan, MoreThanOrEqual, Between } from 'typeorm';

const productRepository = AppDataSource.getRepository(Product);
const reviewRepository = AppDataSource.getRepository(Review);

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { category, keyword, page = 1, pageSize = 12, isActive, maxStock, minStock } = req.query;
    const where: any = {};

    if (isActive !== undefined && isActive !== '' && String(isActive) !== 'all') {
      where.isActive = String(isActive) === 'true';
    } else if (String(isActive) === 'all') {
      // 不传或传 all 不过滤 isActive
    } else {
      where.isActive = true;
    }

    if (category) {
      where.category = category as TeaCategory;
    }

    if (keyword) {
      where.name = ILike(`%${keyword}%`);
    }

    if (maxStock !== undefined && maxStock !== '' && minStock !== undefined && minStock !== '') {
      where.stock = Between(Number(minStock), Number(maxStock) - 1);
    } else if (maxStock !== undefined && maxStock !== '') {
      where.stock = LessThan(Number(maxStock));
    } else if (minStock !== undefined && minStock !== '') {
      where.stock = MoreThanOrEqual(Number(minStock));
    }

    const [products, total] = await productRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
    });

    res.json({
      data: products,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (error) {
    res.status(500).json({ message: '获取商品列表失败', error });
  }
};

export const updateProductStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const product = await productRepository.findOneBy({ id: Number(id) });

    if (!product) {
      return res.status(404).json({ message: '商品不存在' });
    }

    product.isActive = isActive;
    await productRepository.save(product);
    res.json({ message: isActive ? '已上架' : '已下架', product });
  } catch (error) {
    res.status(500).json({ message: '更新商品状态失败', error });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await productRepository.findOne({
      where: { id: Number(id) },
    });

    if (!product) {
      return res.status(404).json({ message: '商品不存在' });
    }

    const reviews = await reviewRepository.find({
      where: { productId: Number(id) },
      relations: ['member'],
      order: { createdAt: 'DESC' },
      take: 10,
    });

    const reviewCount = await reviewRepository.count({ where: { productId: Number(id) } });

    res.json({
      product,
      reviews,
      reviewCount,
    });
  } catch (error) {
    res.status(500).json({ message: '获取商品详情失败', error });
  }
};

export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = 1, pageSize = 10 } = req.query;

    const [reviews, total] = await reviewRepository.findAndCount({
      where: { productId: Number(id) },
      relations: ['member'],
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
    res.status(500).json({ message: '获取评价失败', error });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = productRepository.create(req.body);
    await productRepository.save(product);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: '创建商品失败', error });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await productRepository.findOneBy({ id: Number(id) });

    if (!product) {
      return res.status(404).json({ message: '商品不存在' });
    }

    productRepository.merge(product, req.body);
    await productRepository.save(product);
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: '更新商品失败', error });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await productRepository.delete(id);
    if (result.affected === 0) {
      return res.status(404).json({ message: '商品不存在' });
    }
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ message: '删除商品失败', error });
  }
};
