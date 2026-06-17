import { AppDataSource } from './data-source';
import bcrypt from 'bcryptjs';

async function migrate() {
  try {
    await AppDataSource.initialize();
    console.log('数据源已连接');

    const queryRunner = AppDataSource.createQueryRunner();

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(50) NOT NULL,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(20) NOT NULL CHECK (category IN ('green', 'black', 'oolong', 'white', 'dark', 'yellow')),
        "originStory" TEXT,
        "harvestYear" INTEGER NOT NULL,
        process TEXT,
        "reviewScore" DECIMAL(3,1) DEFAULT 0,
        "pricePer100g" DECIMAL(10,2) NOT NULL,
        "boxPrice" DECIMAL(10,2),
        "giftBoxPrice" DECIMAL(10,2),
        "minWeight" INTEGER DEFAULT 100,
        stock INTEGER DEFAULT 0,
        image VARCHAR(255),
        "isActive" BOOLEAN DEFAULT true,
        description TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS members (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        password VARCHAR(255),
        level VARCHAR(20) DEFAULT 'normal' CHECK (level IN ('normal', 'silver', 'gold', 'diamond')),
        "totalSpent" DECIMAL(10,2) DEFAULT 0,
        birthday DATE,
        "birthdayGiftSent" BOOLEAN DEFAULT false,
        points INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        "productId" INTEGER REFERENCES products(id),
        "memberId" INTEGER REFERENCES members(id),
        rating INTEGER NOT NULL,
        content TEXT,
        images VARCHAR(255),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        "orderNo" VARCHAR(32) UNIQUE NOT NULL,
        "memberId" INTEGER REFERENCES members(id),
        "totalAmount" DECIMAL(10,2) NOT NULL,
        "discountAmount" DECIMAL(10,2) DEFAULT 0,
        "actualAmount" DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'completed', 'cancelled')),
        "shippingAddress" VARCHAR(500) NOT NULL,
        "contactPhone" VARCHAR(20) NOT NULL,
        "contactName" VARCHAR(50) NOT NULL,
        remark TEXT,
        "paidAt" TIMESTAMP,
        "shippedAt" TIMESTAMP,
        "completedAt" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        "orderId" INTEGER REFERENCES orders(id),
        "productId" INTEGER REFERENCES products(id),
        "packageType" VARCHAR(20) DEFAULT 'loose' CHECK ("packageType" IN ('loose', 'box', 'giftbox')),
        weight INTEGER DEFAULT 100,
        quantity INTEGER DEFAULT 1,
        "unitPrice" DECIMAL(10,2) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        "productName" VARCHAR(100) NOT NULL,
        "productImage" VARCHAR(255)
      );

      CREATE TABLE IF NOT EXISTS tasting_events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        "eventDate" TIMESTAMP NOT NULL,
        location VARCHAR(200) NOT NULL,
        "maxParticipants" INTEGER DEFAULT 20,
        "currentParticipants" INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
        image VARCHAR(255),
        "teaList" TEXT,
        host VARCHAR(255),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tasting_registrations (
        id SERIAL PRIMARY KEY,
        "eventId" INTEGER REFERENCES tasting_events(id),
        "memberId" INTEGER REFERENCES members(id),
        "guestsCount" INTEGER DEFAULT 1,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'attended')),
        remark TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
      CREATE INDEX IF NOT EXISTS idx_products_active ON products("isActive");
      CREATE INDEX IF NOT EXISTS idx_orders_member ON orders("memberId");
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
      CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews("productId");
      CREATE INDEX IF NOT EXISTS idx_tasting_status ON tasting_events(status);
    `);

    console.log('表结构创建完成');

    const hashedPassword = await bcrypt.hash('admin123', 10);
    await queryRunner.query(`
      INSERT INTO admins (username, password, name)
      VALUES ('admin', $1, '系统管理员')
      ON CONFLICT (username) DO NOTHING;
    `, [hashedPassword]);

    const sampleProducts = [
      { name: '西湖龙井', category: 'green', originStory: '西湖龙井茶产自浙江杭州西湖周边群山，已有1200多年历史。', harvestYear: 2024, process: '采摘→摊放→杀青→揉捻→干燥', reviewScore: 9.5, pricePer100g: 298, boxPrice: 568, giftBoxPrice: 1288, stock: 500, description: '中国十大名茶之首，色泽翠绿，香气清高，滋味鲜爽。' },
      { name: '碧螺春', category: 'green', originStory: '碧螺春产自江苏苏州太湖洞庭山，因形美、色艳、香浓、味醇而闻名。', harvestYear: 2024, process: '采摘→杀青→揉捻→搓团显毫→烘干', reviewScore: 9.3, pricePer100g: 258, boxPrice: 498, giftBoxPrice: 1088, stock: 400, description: '条索纤细，卷曲成螺，满披茸毛，香气浓郁。' },
      { name: '正山小种', category: 'black', originStory: '正山小种产自福建武夷山桐木村，是世界上最早的红茶。', harvestYear: 2023, process: '采摘→萎凋→揉捻→发酵→过红锅→复揉→熏焙→复火', reviewScore: 9.2, pricePer100g: 198, boxPrice: 368, giftBoxPrice: 888, stock: 600, description: '条索紧结，色泽乌润，香气高长，滋味醇厚。' },
      { name: '祁门红茶', category: 'black', originStory: '祁门红茶产自安徽祁门，是世界三大高香红茶之一。', harvestYear: 2023, process: '采摘→萎凋→揉捻→发酵→干燥', reviewScore: 9.4, pricePer100g: 228, boxPrice: 428, giftBoxPrice: 968, stock: 450, description: '条索紧细，色泽乌润，香气清香持久，似蜜糖香。' },
      { name: '安溪铁观音', category: 'oolong', originStory: '安溪铁观音产自福建安溪，属于半发酵乌龙茶。', harvestYear: 2024, process: '采摘→晒青→凉青→摇青→杀青→揉捻→初烘→包揉→复烘→复包揉→烘干', reviewScore: 9.6, pricePer100g: 358, boxPrice: 688, giftBoxPrice: 1588, stock: 350, description: '外形卷曲，色泽砂绿，香气馥郁，滋味醇厚甘鲜。' },
      { name: '大红袍', category: 'oolong', originStory: '大红袍产自福建武夷山，是武夷岩茶之王。', harvestYear: 2023, process: '采摘→萎凋→做青→杀青→揉捻→初烘→复烘→拣剔', reviewScore: 9.7, pricePer100g: 598, boxPrice: 1188, giftBoxPrice: 2888, stock: 200, description: '外形条索紧结，色泽绿褐鲜润，香气馥郁持久。' },
      { name: '福鼎白毫银针', category: 'white', originStory: '白毫银针产自福建福鼎，是白茶中的极品。', harvestYear: 2024, process: '采摘→萎凋→烘干', reviewScore: 9.1, pricePer100g: 488, boxPrice: 958, giftBoxPrice: 2188, stock: 250, description: '芽头肥壮，满披白毫，挺直如针，色白似银。' },
      { name: '福鼎白牡丹', category: 'white', originStory: '白牡丹产自福建福鼎，因其绿叶夹银白色毫心，形似花朵而得名。', harvestYear: 2023, process: '采摘→萎凋→烘干', reviewScore: 8.9, pricePer100g: 268, boxPrice: 518, giftBoxPrice: 1188, stock: 300, description: '外形毫心肥壮，叶张肥嫩，毫香显著，滋味鲜醇。' },
      { name: '云南普洱茶熟茶', category: 'dark', originStory: '普洱茶产自云南，以云南大叶种晒青茶为原料，经发酵制成。', harvestYear: 2020, process: '采摘→杀青→揉捻→晒干→渥堆发酵→压制成饼', reviewScore: 9.0, pricePer100g: 168, boxPrice: 328, giftBoxPrice: 688, stock: 800, description: '外形紧结，色泽红褐，香气陈香浓郁，滋味醇厚回甘。' },
      { name: '湖南安化黑茶', category: 'dark', originStory: '安化黑茶产自湖南安化，是中国黑茶的发源地之一。', harvestYear: 2021, process: '采摘→杀青→初揉→渥堆→复揉→烘焙', reviewScore: 8.8, pricePer100g: 128, boxPrice: 248, giftBoxPrice: 588, stock: 700, description: '外形卷折成条，色泽油黑，香气纯正，滋味醇和。' },
      { name: '君山银针', category: 'yellow', originStory: '君山银针产自湖南岳阳君山岛，是中国十大名茶之一。', harvestYear: 2024, process: '采摘→杀青→摊晾→初烘→初包→复烘→复包→足火', reviewScore: 9.2, pricePer100g: 388, boxPrice: 738, giftBoxPrice: 1688, stock: 180, description: '芽头茁壮，满披茸毛，色泽金黄光亮，香气清鲜。' },
      { name: '蒙顶黄芽', category: 'yellow', originStory: '蒙顶黄芽产自四川蒙山，是中国最古老的名茶之一。', harvestYear: 2024, process: '采摘→杀青→初烘→闷黄→复烘→整形→干燥', reviewScore: 9.0, pricePer100g: 328, boxPrice: 628, giftBoxPrice: 1388, stock: 220, description: '外形扁直，色泽黄润，香气甜香浓郁，滋味甘醇鲜爽。' },
    ];

    for (const product of sampleProducts) {
      await queryRunner.query(`
        INSERT INTO products (name, category, "originStory", "harvestYear", process, "reviewScore", "pricePer100g", "boxPrice", "giftBoxPrice", stock, description)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT DO NOTHING;
      `, [product.name, product.category, product.originStory, product.harvestYear, product.process, product.reviewScore, product.pricePer100g, product.boxPrice, product.giftBoxPrice, product.stock, product.description]);
    }

    console.log('示例数据插入完成');

    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 15, 14, 0, 0);
    const nextNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 20, 14, 0, 0);

    const sampleEvents = [
      {
        title: '春茶品鉴会',
        description: '品尝2024年新上市的春茶，感受春天的气息。',
        eventDate: nextMonth,
        location: '北京市朝阳区茶叶品鉴中心',
        maxParticipants: 30,
        teaList: '西湖龙井、碧螺春、黄山毛峰',
        host: '国家级评茶师 张老师',
      },
      {
        title: '乌龙茶深度品鉴',
        description: '深入了解乌龙茶的制作工艺和品鉴技巧。',
        eventDate: nextNextMonth,
        location: '上海市静安区茶文化体验馆',
        maxParticipants: 25,
        teaList: '铁观音、大红袍、凤凰单丛',
        host: '茶文化专家 李老师',
      },
    ];

    for (const event of sampleEvents) {
      await queryRunner.query(`
        INSERT INTO tasting_events (title, description, "eventDate", location, "maxParticipants", "teaList", host)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT DO NOTHING;
      `, [event.title, event.description, event.eventDate, event.location, event.maxParticipants, event.teaList, event.host]);
    }

    console.log('品鉴会数据插入完成');

    await queryRunner.release();
    await AppDataSource.destroy();
    console.log('数据库迁移完成！');
    console.log('默认管理员账号: admin / admin123');
  } catch (error) {
    console.error('迁移失败:', error);
    process.exit(1);
  }
}

migrate();
