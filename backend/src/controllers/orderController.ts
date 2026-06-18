import { Request, Response } from 'express';
import { AppDataSource } from '../db/data-source';
import { Order, OrderStatus } from '../entities/Order';
import { OrderItem, PackageType } from '../entities/OrderItem';
import { Product } from '../entities/Product';
import { Member, getMemberDiscount, calcMemberLevel } from '../entities/Member';
import { AuthRequest } from '../middleware/auth';

const orderRepository = AppDataSource.getRepository(Order);
const orderItemRepository = AppDataSource.getRepository(OrderItem);
const productRepository = AppDataSource.getRepository(Product);
const memberRepository = AppDataSource.getRepository(Member);

export const createOrder = async (req: AuthRequest, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const { items, shippingAddress, contactPhone, contactName, remark } = req.body;
    const memberId = req.member!.id;

    const member = await memberRepository.findOneBy({ id: memberId });
    if (!member) {
      throw new Error('用户不存在');
    }

    let totalAmount = 0;
    const orderItems: OrderItem[] = [];

    for (const item of items) {
      const product = await productRepository.findOneBy({ id: item.productId });
      if (!product || !product.isActive) {
        throw new Error(`商品 ${item.productId} 不存在或已下架`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`商品 ${product.name} 库存不足`);
      }

      let unitPrice = product.pricePer100g;
      if (item.packageType === 'box' && product.boxPrice) {
        unitPrice = product.boxPrice;
      } else if (item.packageType === 'giftbox' && product.giftBoxPrice) {
        unitPrice = product.giftBoxPrice;
      }

      const subtotal = unitPrice * item.quantity;
      totalAmount += subtotal;

      const orderItem = new OrderItem();
      orderItem.productId = item.productId;
      orderItem.packageType = item.packageType as PackageType;
      orderItem.weight = item.weight || 100;
      orderItem.quantity = item.quantity;
      orderItem.unitPrice = unitPrice;
      orderItem.subtotal = subtotal;
      orderItem.productName = product.name;
      orderItem.productImage = product.image;

      orderItems.push(orderItem);

      product.stock -= item.quantity;
      await queryRunner.manager.save(product);
    }

    const discount = getMemberDiscount(member.level);
    const discountAmount = totalAmount * (1 - discount);
    const actualAmount = totalAmount - discountAmount;

    const orderNo = 'ORD' + Date.now() + Math.random().toString(36).substring(2, 8).toUpperCase();

    const order = new Order();
    order.orderNo = orderNo;
    order.memberId = memberId;
    order.totalAmount = totalAmount;
    order.discountAmount = discountAmount;
    order.actualAmount = actualAmount;
    order.status = 'pending';
    order.shippingAddress = shippingAddress;
    order.contactPhone = contactPhone;
    order.contactName = contactName;
    order.remark = remark;
    order.items = orderItems;

    await queryRunner.manager.save(order);

    member.totalSpent = Number(member.totalSpent) + actualAmount;
    member.points = member.points + Math.floor(actualAmount);
    member.level = calcMemberLevel(member.totalSpent);
    await queryRunner.manager.save(member);

    await queryRunner.commitTransaction();

    res.status(201).json({
      message: '订单创建成功',
      orderId: order.id,
      orderNo: order.orderNo,
      totalAmount,
      discountAmount,
      actualAmount,
    });
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    res.status(400).json({ message: error.message || '创建订单失败' });
  } finally {
    await queryRunner.release();
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { status, page = 1, pageSize = 10 } = req.query;
    const where: any = { memberId: req.member!.id };

    if (status) {
      where.status = status as OrderStatus;
    }

    const [orders, total] = await orderRepository.findAndCount({
      where,
      relations: ['items'],
      order: { createdAt: 'DESC' },
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
    });

    res.json({
      data: orders,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (error) {
    res.status(500).json({ message: '获取订单列表失败', error });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const order = await orderRepository.findOne({
      where: { id: Number(id), memberId: req.member!.id },
      relations: ['items'],
    });

    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: '获取订单详情失败', error });
  }
};

export const payOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const order = await orderRepository.findOne({
      where: { id: Number(id), memberId: req.member!.id },
    });

    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ message: '订单状态不允许支付' });
    }

    order.status = 'paid';
    order.paidAt = new Date();
    await orderRepository.save(order);

    res.json({ message: '支付成功', order });
  } catch (error) {
    res.status(500).json({ message: '支付失败', error });
  }
};

export const confirmOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const order = await orderRepository.findOne({
      where: { id: Number(id), memberId: req.member!.id },
    });

    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }

    if (order.status !== 'shipped') {
      return res.status(400).json({ message: '订单状态不允许确认收货' });
    }

    order.status = 'completed';
    order.completedAt = new Date();
    await orderRepository.save(order);

    res.json({ message: '确认收货成功', order });
  } catch (error) {
    res.status(500).json({ message: '确认收货失败', error });
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const order = await orderRepository.findOne({
      where: { id: Number(id), memberId: req.member!.id },
      relations: ['items'],
    });

    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ message: '订单状态不允许取消' });
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const item of order.items) {
        const product = await productRepository.findOneBy({ id: item.productId });
        if (product) {
          product.stock += item.quantity;
          await queryRunner.manager.save(product);
        }
      }

      order.status = 'cancelled';
      await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();
      res.json({ message: '取消成功' });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  } catch (error) {
    res.status(500).json({ message: '取消失败', error });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const { status, page = 1, pageSize = 20, keyword } = req.query;
    const where: any = {};

    if (status) {
      where.status = status as OrderStatus;
    }

    const [orders, total] = await orderRepository.findAndCount({
      where,
      relations: ['items', 'member'],
      order: { createdAt: 'DESC' },
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
    });

    res.json({
      data: orders,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (error) {
    res.status(500).json({ message: '获取订单列表失败', error });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await orderRepository.findOneBy({ id: Number(id) });
    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }

    order.status = status as OrderStatus;

    if (status === 'shipped') {
      order.shippedAt = new Date();
    } else if (status === 'completed') {
      order.completedAt = new Date();
    }

    await orderRepository.save(order);
    res.json({ message: '状态更新成功', order });
  } catch (error) {
    res.status(500).json({ message: '更新失败', error });
  }
};
