/**
 * 低库存功能 - 后端接口验证
 */
import http from 'http';

function request(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    }).on('error', reject);
  });
}

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (e) {
    console.log(`❌ ${name}`);
    console.log(`   ${e.message}`);
    failed++;
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || '断言失败');
}

console.log('========================================================');
console.log('       低库存功能 - 后端接口 & 前端逻辑验证');
console.log('========================================================\n');

// 模拟前端阈值与辅助函数
const STOCK_LOW_THRESHOLD = 10000; // 10kg
function getStockStatus(stock) {
  if (stock <= 0) return 'out_of_stock';
  if (stock < STOCK_LOW_THRESHOLD) return 'low';
  return 'normal';
}
function formatStockDisplay(stock) {
  if (stock >= 1000) return `${(stock / 1000).toFixed(1)}kg`;
  return `${stock}g`;
}

// ============ 前端辅助函数验证 ============
console.log('【前端辅助函数验证】');
console.log('--------------------------------------------------------');

test('getStockStatus(0) → out_of_stock', () => {
  assert(getStockStatus(0) === 'out_of_stock');
});
test('getStockStatus(500) → low (500g < 10kg)', () => {
  assert(getStockStatus(500) === 'low');
});
test('getStockStatus(9999) → low', () => {
  assert(getStockStatus(9999) === 'low');
});
test('getStockStatus(10000) → normal (10kg 刚好)', () => {
  assert(getStockStatus(10000) === 'normal');
});
test('getStockStatus(50000) → normal (50kg)', () => {
  assert(getStockStatus(50000) === 'normal');
});
test('formatStockDisplay(500) → "500g"', () => {
  assert(formatStockDisplay(500) === '500g');
});
test('formatStockDisplay(5000) → "5.0kg"', () => {
  assert(formatStockDisplay(5000) === '5.0kg');
});
test('formatStockDisplay(12500) → "12.5kg"', () => {
  assert(formatStockDisplay(12500) === '12.5kg');
});

// ============ 后端接口验证 ============
console.log('\n【后端接口验证】');
console.log('--------------------------------------------------------');

(async () => {
  try {
    // 1. 不带参数的基础查询
    const r1 = await request('http://localhost:3000/api/products?page=1&pageSize=5');
    test('GET /products 基本查询返回 200', () => {
      assert(r1.status === 200, `状态码 ${r1.status}`);
      assert(Array.isArray(r1.data.data), 'data 应为数组');
    });

    // 2. maxStock=10000（低于10kg）
    const r2 = await request('http://localhost:3000/api/products?maxStock=10000&pageSize=50&isActive=all');
    test('GET /products?maxStock=10000 只返回库存 < 10000g 的商品', () => {
      assert(r2.status === 200, `状态码 ${r2.status}`);
      const allLow = r2.data.data.every((p) => p.stock < 10000);
      assert(allLow, `部分商品库存 >= 10000：${r2.data.data.filter(p => p.stock >= 10000).map(p => `${p.name}=${p.stock}`).join(',')}`);
    });
    console.log(`   📊 低库存商品数: ${r2.data.total || r2.data.data.length}`);
    if (r2.data.data.length > 0) {
      r2.data.data.slice(0, 5).forEach((p) => {
        console.log(`     - ${p.name}: ${formatStockDisplay(p.stock)} (${getStockStatus(p.stock)})`);
      });
      if (r2.data.data.length > 5) console.log(`     ... 共 ${r2.data.data.length} 款`);
    }

    // 3. minStock=10000（正常库存）
    const r3 = await request('http://localhost:3000/api/products?minStock=10000&pageSize=10');
    test('GET /products?minStock=10000 返回库存 >= 10kg 的商品', () => {
      assert(r3.status === 200, `状态码 ${r3.status}`);
      const allNormal = r3.data.data.every((p) => p.stock >= 10000);
      assert(allNormal, `部分商品库存 < 10000：${r3.data.data.filter(p => p.stock < 10000).map(p => p.name).join(',')}`);
    });

    // 4. 缺货查询（maxStock=1）
    const r4 = await request('http://localhost:3000/api/products?maxStock=1&pageSize=10&isActive=all');
    test('GET /products?maxStock=1 返回缺货或近缺货商品（stock ≤ 0）', () => {
      assert(r4.status === 200, `状态码 ${r4.status}`);
      const allOut = r4.data.data.every((p) => p.stock <= 0);
      assert(allOut, `部分商品 stock > 0：${r4.data.data.filter(p => p.stock > 0).map(p => p.name).join(',')}`);
    });
    console.log(`   📊 缺货商品数: ${r4.data.total || r4.data.data.length}`);

    // 5. isActive=all 同时返回上下架
    const r5 = await request('http://localhost:3000/api/products?isActive=all&pageSize=20');
    test('GET /products?isActive=all 返回上架 + 下架商品', () => {
      assert(r5.status === 200, `状态码 ${r5.status}`);
      assert(r5.data.data.length > 0, '应有数据');
    });

    // 6. 区间查询：低库存 1g ~ 9999g
    const r6 = await request('http://localhost:3000/api/products?minStock=1&maxStock=10000&pageSize=10&isActive=all');
    test('GET /products?minStock=1&maxStock=10000 返回偏低库存（1g~9999g）', () => {
      assert(r6.status === 200, `状态码 ${r6.status}`);
      const allLow = r6.data.data.every((p) => p.stock >= 1 && p.stock < 10000);
      assert(allLow, `区间查询不正确`);
    });
  } catch (e) {
    console.log('❌ 接口请求失败', e.message);
    failed++;
  }

  console.log('\n========================================================');
  console.log('                       测试汇总');
  console.log('========================================================\n');
  const total = passed + failed;
  console.log(`总测试数: ${total}`);
  console.log(`✅ 通过: ${passed}`);
  console.log(`❌ 失败: ${failed}`);
  console.log(`通过率: ${((passed / total) * 100).toFixed(1)}%\n`);
  process.exit(failed > 0 ? 1 : 0);
})();
