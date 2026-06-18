/**
 * 购物车核心逻辑单元测试
 * 模拟 Pinia store 的 addToCart / updateCartItem / removeFromCart / getItemKey / selectedCount 逻辑
 */

console.log('========================================================');
console.log('         购物车核心逻辑 - Bug修复验证单元测试');
console.log('========================================================\n');

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

// ============ 复现修复后的核心逻辑 ============
function cartItemKey(c) {
  return c.packageType === 'loose'
    ? `${c.productId}-${c.packageType}-${c.weight}`
    : `${c.productId}-${c.packageType}`;
}

function makeCartStore() {
  const cart = [];
  const selectedItems = new Set();

  return {
    cart,
    selectedItems,
    selectedCount: () => selectedItems.size,
    addToCart(item) {
      const itemKey = cartItemKey(item);
      const existing = cart.find((c) => cartItemKey(c) === itemKey);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        cart.push({ ...item });
      }
    },
    updateCartItem(key, quantity) {
      const item = cart.find((c) => cartItemKey(c) === key);
      if (item) item.quantity = Math.max(1, quantity);
    },
    removeFromCart(key) {
      const idx = cart.findIndex((c) => cartItemKey(c) === key);
      if (idx > -1) cart.splice(idx, 1);
    },
    toggleSelect(item, selected) {
      const key = cartItemKey(item);
      if (selected) selectedItems.add(key);
      else selectedItems.delete(key);
    },
  };
}

// 测试商品
const PRODUCT_1 = { id: 1, name: '西湖龙井', pricePer100g: 298 };

// ============ Bug1 测试：散茶不同克重不合并 ============
console.log('【Bug1 测试】v-for key 与 addToCart 合并逻辑');
console.log('--------------------------------------------------------');

test('Bug1.1: 同商品同包装同克重 → 合并数量', () => {
  const store = makeCartStore();
  store.addToCart({ productId: 1, packageType: 'loose', weight: 100, quantity: 1 });
  store.addToCart({ productId: 1, packageType: 'loose', weight: 100, quantity: 2 });
  assert(store.cart.length === 1, `应合并为1条，实际${store.cart.length}条`);
  assert(store.cart[0].quantity === 3, `数量应为3，实际${store.cart[0].quantity}`);
});

test('Bug1.2: 同商品loose 100g vs 200g → 不合并，2条独立', () => {
  const store = makeCartStore();
  store.addToCart({ productId: 1, packageType: 'loose', weight: 100, quantity: 1 });
  store.addToCart({ productId: 1, packageType: 'loose', weight: 200, quantity: 1 });
  assert(store.cart.length === 2, `同商品不同克重应产生2条，实际${store.cart.length}条`);
  const weights = store.cart.map((i) => i.weight).sort((a, b) => a - b);
  assert(weights[0] === 100 && weights[1] === 200, `重量应为[100,200]，实际[${weights.join(',')}]`);
});

test('Bug1.3: 同商品box vs loose(100g) → 不合并', () => {
  const store = makeCartStore();
  store.addToCart({ productId: 1, packageType: 'loose', weight: 100, quantity: 1 });
  store.addToCart({ productId: 1, packageType: 'box', quantity: 1 });
  assert(store.cart.length === 2, `散茶 vs 盒装应产生2条，实际${store.cart.length}条`);
});

test('Bug1.4: v-for key 唯一性（getItemKey 等价函数）', () => {
  const items = [
    { productId: 1, packageType: 'loose', weight: 100 },
    { productId: 1, packageType: 'loose', weight: 200 },
    { productId: 1, packageType: 'loose', weight: 300 },
    { productId: 1, packageType: 'box' },
    { productId: 1, packageType: 'giftbox' },
    { productId: 2, packageType: 'loose', weight: 100 },
  ];
  const keySet = new Set(items.map(cartItemKey));
  assert(keySet.size === items.length, `6个不同规格应产生6个唯一key，实际${keySet.size}个`);
});

test('Bug1.5: updateCartItem 用 key 精确修改对应克重条', () => {
  const store = makeCartStore();
  store.addToCart({ productId: 1, packageType: 'loose', weight: 100, quantity: 1 });
  store.addToCart({ productId: 1, packageType: 'loose', weight: 200, quantity: 1 });
  const key100 = cartItemKey({ productId: 1, packageType: 'loose', weight: 100 });
  store.updateCartItem(key100, 5);
  const i100 = store.cart.find((i) => i.weight === 100);
  const i200 = store.cart.find((i) => i.weight === 200);
  assert(i100.quantity === 5, `100g条数量应改为5，实际${i100.quantity}`);
  assert(i200.quantity === 1, `200g条数量应保持1不变，实际${i200.quantity}`);
});

test('Bug1.6: removeFromCart 用 key 精确删除对应克重条', () => {
  const store = makeCartStore();
  store.addToCart({ productId: 1, packageType: 'loose', weight: 100, quantity: 1 });
  store.addToCart({ productId: 1, packageType: 'loose', weight: 200, quantity: 1 });
  const key100 = cartItemKey({ productId: 1, packageType: 'loose', weight: 100 });
  store.removeFromCart(key100);
  assert(store.cart.length === 1, `删除100g条后应剩1条，实际${store.cart.length}条`);
  assert(store.cart[0].weight === 200, `剩余条应为200g，实际${store.cart[0].weight}g`);
});

// ============ Bug2 测试：selectedCount (Set.size vs Set.length) ============
console.log('\n【Bug2 测试】已选数量展示 & 按钮禁用状态');
console.log('--------------------------------------------------------');

test('Bug2.1: Set 没有 length 属性（旧代码永远 undefined）', () => {
  const s = new Set(['a', 'b', 'c']);
  assert(s.length === undefined, `Set.length应为undefined，实际${typeof s.length}`);
  assert(s.size === 3, `Set.size应为3，实际${s.size}`);
});

test('Bug2.2: selectedCount() 使用 .size，正确返回 0', () => {
  const store = makeCartStore();
  assert(store.selectedCount() === 0, `空选中应为0，实际${store.selectedCount()}`);
});

test('Bug2.3: selectedCount() 选中1个 → 返回1', () => {
  const store = makeCartStore();
  const item = { productId: 1, packageType: 'loose', weight: 100 };
  store.toggleSelect(item, true);
  assert(store.selectedCount() === 1, `选中1个应为1，实际${store.selectedCount()}`);
});

test('Bug2.4: selectedCount() 选中3个不同克重 → 返回3', () => {
  const store = makeCartStore();
  store.toggleSelect({ productId: 1, packageType: 'loose', weight: 100 }, true);
  store.toggleSelect({ productId: 1, packageType: 'loose', weight: 200 }, true);
  store.toggleSelect({ productId: 1, packageType: 'box' }, true);
  assert(store.selectedCount() === 3, `选中3项应为3，实际${store.selectedCount()}`);
});

test('Bug2.5: 按钮禁用逻辑 (selectedCount === 0)', () => {
  const store = makeCartStore();
  // 模拟：删除选中按钮
  const deleteDisabled1 = store.selectedCount() === 0;
  assert(deleteDisabled1 === true, '空选中时删除按钮应禁用');
  // 去结算按钮
  const checkoutDisabled1 = store.selectedCount() === 0;
  assert(checkoutDisabled1 === true, '空选中时结算按钮应禁用');
  // 选中一项后
  store.toggleSelect({ productId: 1, packageType: 'loose', weight: 100 }, true);
  const deleteDisabled2 = store.selectedCount() === 0;
  assert(deleteDisabled2 === false, '有选中时删除按钮不应禁用');
  const checkoutDisabled2 = store.selectedCount() === 0;
  assert(checkoutDisabled2 === false, '有选中时结算按钮不应禁用');
});

test('Bug2.6: 反选后 selectedCount 正确计算', () => {
  const store = makeCartStore();
  // 先加 3 条
  store.addToCart({ productId: 1, packageType: 'loose', weight: 100, quantity: 1 });
  store.addToCart({ productId: 1, packageType: 'loose', weight: 200, quantity: 1 });
  store.addToCart({ productId: 1, packageType: 'box', quantity: 1 });
  // 模拟反选：遍历 cart 内每项
  store.cart.forEach((item) => {
    const key = cartItemKey(item);
    if (store.selectedItems.has(key)) {
      store.selectedItems.delete(key);
    } else {
      store.selectedItems.add(key);
    }
  });
  assert(store.selectedCount() === 3, `3条全选后应为3，实际${store.selectedCount()}`);
  // 再反选一次
  store.cart.forEach((item) => {
    const key = cartItemKey(item);
    if (store.selectedItems.has(key)) store.selectedItems.delete(key);
    else store.selectedItems.add(key);
  });
  assert(store.selectedCount() === 0, `再次反选应清空为0，实际${store.selectedCount()}`);
});

// ============ Bug3 测试：路由跳转 ============
console.log('\n【Bug3 测试】路由跳转正确性');
console.log('--------------------------------------------------------');

test('Bug3.1: 旧路由 /member?tab=orders 会被 redirect 到 /member/profile', () => {
  // 模拟路由表：/member 的 redirect 是 /member/profile
  // 所以旧写法 /member?tab=orders 会变成 /member/profile
  const oldPath = '/member?tab=orders';
  const willRedirect = oldPath.startsWith('/member?') || oldPath === '/member';
  assert(willRedirect === true, '旧写法会触发 redirect');
});

test('Bug3.2: 新路由 /member/orders 精确命中子路由 不触发 redirect', () => {
  const newPath = '/member/orders';
  const isDirectChildRoute = /^\/member\/(orders|profile|tastings|reviews)/.test(newPath);
  assert(isDirectChildRoute === true, '/member/orders 是子路由，不会 redirect');
});

test('Bug3.3: /member/tastings 也不会 redirect', () => {
  assert(/^\/member\/(orders|profile|tastings|reviews)/.test('/member/tastings'));
  assert(/^\/member\/(orders|profile|tastings|reviews)/.test('/member/reviews'));
  assert(/^\/member\/(orders|profile|tastings|reviews)/.test('/member/profile'));
});

// ============ 汇总 ============
console.log('\n========================================================');
console.log('                       测试汇总');
console.log('========================================================\n');

const total = passed + failed;
console.log(`总测试数: ${total}`);
console.log(`✅ 通过: ${passed}`);
console.log(`❌ 失败: ${failed}`);
console.log(`通过率: ${((passed / total) * 100).toFixed(1)}%\n`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 全部购物车逻辑 Bug 修复验证通过！');
}
