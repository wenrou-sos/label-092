export type TeaCategory = 'green' | 'black' | 'oolong' | 'white' | 'dark' | 'yellow';

export const TeaCategoryMap: Record<TeaCategory, string> = {
  green: '绿茶',
  black: '红茶',
  oolong: '乌龙茶',
  white: '白茶',
  dark: '黑茶',
  yellow: '黄茶',
};

export type StockStatus = 'normal' | 'low' | 'out_of_stock';

export const STOCK_LOW_THRESHOLD = 10000;
export const STOCK_OUT_THRESHOLD = 0;

export const StockStatusMap: Record<StockStatus, string> = {
  normal: '正常',
  low: '偏低',
  out_of_stock: '缺货',
};

export const StockStatusTypeMap: Record<StockStatus, 'success' | 'warning' | 'danger'> = {
  normal: 'success',
  low: 'warning',
  out_of_stock: 'danger',
};

export const getStockStatus = (stock: number): StockStatus => {
  if (stock <= STOCK_OUT_THRESHOLD) return 'out_of_stock';
  if (stock < STOCK_LOW_THRESHOLD) return 'low';
  return 'normal';
};

export const formatStockDisplay = (stock: number): string => {
  if (stock >= 1000) return `${(stock / 1000).toFixed(1)}kg`;
  return `${stock}g`;
};

export interface Product {
  id: number;
  name: string;
  category: TeaCategory;
  originStory: string;
  harvestYear: number;
  process: string;
  reviewScore: number;
  pricePer100g: number;
  boxPrice: number | null;
  giftBoxPrice: number | null;
  minWeight: number;
  stock: number;
  image: string | null;
  isActive: boolean;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export type MemberLevel = 'normal' | 'silver' | 'gold' | 'diamond';

export const MemberLevelMap: Record<MemberLevel, string> = {
  normal: '普通会员',
  silver: '银卡会员',
  gold: '金卡会员',
  diamond: '钻石会员',
};

export const MemberDiscountMap: Record<MemberLevel, number> = {
  normal: 1,
  silver: 0.9,
  gold: 0.85,
  diamond: 0.8,
};

export interface Member {
  id: number;
  phone: string;
  name: string;
  level: MemberLevel;
  totalSpent: number;
  birthday: string | null;
  birthdayGiftSent: boolean;
  points: number;
  discount: number;
  nextLevel: {
    level: string;
    amountNeeded: number;
  } | null;
  createdAt: string;
  orders?: Order[];
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';

export const OrderStatusMap: Record<OrderStatus, string> = {
  pending: '待支付',
  paid: '已支付',
  shipped: '已发货',
  completed: '已完成',
  cancelled: '已取消',
};

export type PackageType = 'loose' | 'box' | 'giftbox';

export const PackageTypeMap: Record<PackageType, string> = {
  loose: '散茶称重',
  box: '盒装',
  giftbox: '礼盒装',
};

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  packageType: PackageType;
  weight: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  productName: string;
  productImage: string | null;
}

export interface Order {
  id: number;
  orderNo: string;
  memberId: number;
  totalAmount: number;
  discountAmount: number;
  actualAmount: number;
  status: OrderStatus;
  shippingAddress: string;
  contactPhone: string;
  contactName: string;
  remark: string | null;
  paidAt: string | null;
  shippedAt: string | null;
  completedAt: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export type TastingStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export const TastingStatusMap: Record<TastingStatus, string> = {
  upcoming: '即将开始',
  ongoing: '进行中',
  completed: '已结束',
  cancelled: '已取消',
};

export interface TastingEvent {
  id: number;
  title: string;
  description: string;
  eventDate: string;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  status: TastingStatus;
  image: string | null;
  teaList: string;
  host: string;
  createdAt: string;
  updatedAt: string;
}

export type RegistrationStatus = 'pending' | 'confirmed' | 'cancelled' | 'attended';

export const RegistrationStatusMap: Record<RegistrationStatus, string> = {
  pending: '待确认',
  confirmed: '已确认',
  cancelled: '已取消',
  attended: '已出席',
};

export interface TastingRegistration {
  id: number;
  eventId: number;
  memberId: number;
  guestsCount: number;
  status: RegistrationStatus;
  remark: string | null;
  event: TastingEvent;
  createdAt: string;
}

export interface Review {
  id: number;
  productId: number;
  memberId: number;
  rating: number;
  content: string;
  images: string | null;
  member: {
    id: number;
    name: string;
  };
  createdAt: string;
}

export interface ApiResponse<T = any> {
  data: T;
  total?: number;
  page?: number;
  pageSize?: number;
  message?: string;
}

export interface CartItem {
  productId: number;
  productName: string;
  productImage: string | null;
  packageType: PackageType;
  weight: number;
  quantity: number;
  unitPrice: number;
  stock: number;
}
