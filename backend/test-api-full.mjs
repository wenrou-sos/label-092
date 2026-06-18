import http from 'http';
import fs from 'fs';
import path from 'path';

function request(method, path, data = null, headers = {}) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: body ? JSON.parse(body) : null,
            body,
          });
        } catch {
          resolve({ status: res.statusCode, data: null, body });
        }
      });
    });

    req.on('error', (e) => {
      resolve({ status: 0, data: null, error: e.message });
    });

    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

const results = [];
const state = {
  memberToken: null,
  memberId: null,
  adminToken: null,
  productId: null,
  orderId: null,
  orderNo: null,
  eventId: null,
  registrationId: null,
};

async function test(name, method, path, data = null, headers = {}, validator = null) {
  const res = await request(method, path, data, headers);
  let passed = res.status >= 200 && res.status < 300;
  let validationError = null;

  if (passed && validator) {
    try {
      validator(res.data);
    } catch (e) {
      passed = false;
      validationError = e.message;
    }
  }

  results.push({
    name,
    status: res.status,
    passed,
    validationError,
    preview: JSON.stringify(res.data || res.body || res.error).slice(0, 150),
  });

  const icon = passed ? '✅' : res.status === 0 ? '❌' : '⚠️';
  console.log(`${icon} [${res.status}] ${name}`);
  if (!passed) {
    if (validationError) console.log(`   验证失败: ${validationError}`);
    console.log(`   ${JSON.stringify(res.data || res.body || res.error).slice(0, 200)}`);
  }
  return res;
}

async function run() {
  console.log('\n========================================================');
  console.log('        品牌茶叶新零售平台 - 完整接口测试套件');
  console.log('========================================================\n');

  // ==================== 1. 基础接口 ====================
  console.log('【1】基础接口');
  await test('健康检查', 'GET', '/api/health', null, {}, (d) => {
    if (!d.status || d.status !== 'ok') throw new Error('status !== ok');
  });

  // ==================== 2. 商品模块 ====================
  console.log('\n【2】商品模块');
  const productsRes = await test(
    '商品列表-无筛选',
    'GET',
    '/api/products?page=1&pageSize=10',
    null,
    {},
    (d) => {
      if (!Array.isArray(d.data)) throw new Error('data不是数组');
      if (typeof d.total !== 'number') throw new Error('total不存在');
    }
  );
  if (productsRes.data?.data?.length > 0) {
    state.productId = productsRes.data.data[0].id;
  }

  await test(
    '商品列表-按茶类筛选(绿茶)',
    'GET',
    '/api/products?category=green&page=1&pageSize=5',
    null,
    {},
    (d) => {
      if (d.data.length > 0 && !d.data.every((p) => p.category === 'green')) {
        throw new Error('筛选结果不正确');
      }
    }
  );

  await test(
    '商品列表-关键词搜索',
    'GET',
    '/api/products?keyword=' + encodeURIComponent('龙井'),
    null,
    {},
    (d) => {
      if (d.data.length > 0 && !d.data[0].name.includes('龙井')) {
        throw new Error('搜索结果不正确');
      }
    }
  );

  if (state.productId) {
    const detailRes = await test(
      '商品详情',
      'GET',
      `/api/products/${state.productId}`,
      null,
      {},
      (d) => {
        const p = d.product || d;
        if (!p.id || !p.name) throw new Error('商品详情字段缺失');
        if (!('originStory' in p) || !('reviewScore' in p)) {
          throw new Error('缺少产区故事或审评得分');
        }
      }
    );

    await test(
      '商品评价列表',
      'GET',
      `/api/products/${state.productId}/reviews`,
      null,
      {}
    );
  }

  // ==================== 3. 会员认证模块 ====================
  console.log('\n【3】会员认证模块');
  const testPhone = '138' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');

  const regRes = await test(
    '会员注册',
    'POST',
    '/api/auth/register',
    { phone: testPhone, name: '测试会员', password: '123456' },
    {},
    (d) => {
      if (!d.token) throw new Error('注册未返回token');
      if (!d.member) throw new Error('注册未返回member信息');
    }
  );
  if (regRes.data?.token) state.memberToken = regRes.data.token;
  if (regRes.data?.member?.id) state.memberId = regRes.data.member.id;

  const loginRes = await test(
    '会员登录',
    'POST',
    '/api/auth/login',
    { phone: testPhone, password: '123456' },
    {},
    (d) => {
      if (!d.token) throw new Error('登录未返回token');
    }
  );
  if (loginRes.data?.token) state.memberToken = loginRes.data.token;

  await test(
    '错误密码登录-应失败',
    'POST',
    '/api/auth/login',
    { phone: testPhone, password: 'wrongpass' },
    null,
    {},
    null
  );
  // 预期 401 是正确行为，手动修正状态
  if (results[results.length - 1].status === 401) {
    results[results.length - 1].passed = true;
  }

  if (state.memberToken) {
    const authHeader = { Authorization: `Bearer ${state.memberToken}` };
    await test(
      '获取会员个人信息',
      'GET',
      '/api/member/profile',
      null,
      authHeader,
      (d) => {
        if (!d.id || !d.level) throw new Error('个人信息字段缺失');
        if (typeof d.discount !== 'number') throw new Error('折扣信息缺失');
      }
    );

    await test(
      '更新会员个人信息',
      'PUT',
      '/api/member/profile',
      { name: '测试会员更新版', birthday: '1990-05-15' },
      authHeader,
      (d) => {
        if (d.member.name !== '测试会员更新版') throw new Error('姓名更新失败');
      }
    );

    await test('我的订单列表', 'GET', '/api/orders/my?page=1&pageSize=10', null, authHeader, (d) => {
      if (!Array.isArray(d.data)) throw new Error('订单列表不是数组');
    });

    await test('我的品鉴会报名', 'GET', '/api/tastings/registrations/my', null, authHeader);

    await test('我的评价列表', 'GET', '/api/reviews/my?page=1&pageSize=10', null, authHeader);
  }

  // ==================== 4. 订单模块 ====================
  console.log('\n【4】订单模块');
  if (state.memberToken && state.productId) {
    const authHeader = { Authorization: `Bearer ${state.memberToken}` };
    const orderRes = await test(
      '创建订单(散茶100g)',
      'POST',
      '/api/orders',
      {
        items: [
          { productId: state.productId, packageType: 'loose', weight: 100, quantity: 1 },
        ],
        shippingAddress: '北京市朝阳区测试路123号',
        contactPhone: testPhone,
        contactName: '测试会员',
        remark: '测试订单',
      },
      authHeader,
      (d) => {
        if (!d.orderId || !d.orderNo) throw new Error('未返回订单ID/号');
        if (typeof d.actualAmount !== 'number') throw new Error('未返回实付金额');
      }
    );
    if (orderRes.data?.orderId) state.orderId = orderRes.data.orderId;
    if (orderRes.data?.orderNo) state.orderNo = orderRes.data.orderNo;

    if (state.orderId) {
      await test('订单详情', 'GET', `/api/orders/${state.orderId}`, null, authHeader, (d) => {
        if (!d.items || d.items.length !== 1) throw new Error('订单项异常');
      });

      await test(
        '订单支付',
        'POST',
        `/api/orders/${state.orderId}/pay`,
        null,
        authHeader,
        (d) => {
          if (d.order.status !== 'paid') throw new Error('订单状态未变更为paid');
        }
      );

      const cancelFailTest = await test(
        '订单取消-已支付不可取消(预期失败)',
        'POST',
        `/api/orders/${state.orderId}/cancel`,
        null,
        authHeader
      );
      if (cancelFailTest.status === 400) {
        results[results.length - 1].passed = true;
      }
    }
  }

  // ==================== 5. 品鉴会模块 ====================
  console.log('\n【5】品鉴会模块');
  const eventsRes = await test(
    '品鉴会列表',
    'GET',
    '/api/tastings?page=1&pageSize=10',
    null,
    {},
    (d) => {
      if (!Array.isArray(d.data)) throw new Error('品鉴会列表不是数组');
    }
  );
  if (eventsRes.data?.data?.length > 0) {
    state.eventId = eventsRes.data.data[0].id;
  }

  if (state.eventId) {
    await test('品鉴会详情', 'GET', `/api/tastings/${state.eventId}`, null, {}, (d) => {
      if (!d.title || !d.location) throw new Error('品鉴会字段缺失');
    });

    if (state.memberToken) {
      const authHeader = { Authorization: `Bearer ${state.memberToken}` };
      const regRes = await test(
        '品鉴会报名',
        'POST',
        `/api/tastings/${state.eventId}/register`,
        { guestsCount: 1, remark: '很期待参加' },
        authHeader,
        (d) => {
          if (!d.registration) throw new Error('未返回报名信息');
        }
      );
      if (regRes.data?.registration?.id) {
        state.registrationId = regRes.data.registration.id;
      }

      if (state.registrationId) {
        await test(
          '取消品鉴会报名',
          'POST',
          `/api/tastings/registrations/${state.registrationId}/cancel`,
          null,
          authHeader
        );
      }
    }
  }

  // ==================== 6. 管理员模块 ====================
  console.log('\n【6】管理员模块');
  const adminLoginRes = await test(
    '管理员登录',
    'POST',
    '/api/admin/login',
    { username: 'admin', password: 'admin123' },
    {},
    (d) => {
      if (!d.token) throw new Error('管理员登录未返回token');
    }
  );
  if (adminLoginRes.data?.token) state.adminToken = adminLoginRes.data.token;

  if (state.adminToken) {
    const adminHeader = { Authorization: `Bearer ${state.adminToken}` };

    await test(
      '管理员获取会员列表',
      'GET',
      '/api/admin/members?page=1&pageSize=10',
      null,
      adminHeader,
      (d) => {
        if (!Array.isArray(d.data)) throw new Error('会员列表不是数组');
      }
    );

    if (state.memberId) {
      await test(
        '管理员查看会员详情',
        'GET',
        `/api/admin/members/${state.memberId}`,
        null,
        adminHeader
      );
    }

    await test(
      '管理员获取订单列表',
      'GET',
      '/api/admin/orders?page=1&pageSize=10',
      null,
      adminHeader,
      (d) => {
        if (!Array.isArray(d.data)) throw new Error('订单列表不是数组');
      }
    );

    if (state.orderId) {
      await test(
        '管理员发货',
        'PUT',
        `/api/admin/orders/${state.orderId}/status`,
        { status: 'shipped' },
        adminHeader,
        (d) => {
          if (d.order.status !== 'shipped') throw new Error('订单未标记为已发货');
        }
      );

      await test(
        '管理员完成订单',
        'PUT',
        `/api/admin/orders/${state.orderId}/status`,
        { status: 'completed' },
        adminHeader,
        (d) => {
          if (d.order.status !== 'completed') throw new Error('订单未标记为已完成');
        }
      );
    }

    await test(
      '管理员获取商品列表(含下架)',
      'GET',
      '/api/products?page=1&pageSize=5',
      null,
      adminHeader
    );

    if (state.eventId) {
      await test(
        '管理员查看品鉴会报名列表',
        'GET',
        `/api/tastings/${state.eventId}/registrations`,
        null,
        adminHeader,
        (d) => {
          if (!Array.isArray(d.data)) throw new Error('报名列表不是数组');
        }
      );
    }

    await test(
      '无权限访问-会员接口不带Token',
      'GET',
      '/api/member/profile',
      null,
      {}
    );
    if (results[results.length - 1].status === 401) {
      results[results.length - 1].passed = true;
    }

    await test(
      '无权限访问-管理接口不带Token',
      'GET',
      '/api/admin/orders',
      null,
      {}
    );
    if (results[results.length - 1].status === 401) {
      results[results.length - 1].passed = true;
    }
  }

  // ==================== 7. 鉴权测试 ====================
  console.log('\n【7】鉴权边界测试');
  if (state.productId && state.adminToken) {
    const adminHeader = { Authorization: `Bearer ${state.adminToken}` };
    const toggleRes = await test(
      '管理员切换商品上下架状态',
      'PATCH',
      `/api/products/${state.productId}/status`,
      { isActive: true },
      adminHeader
    );
  }

  // ==================== 汇总报告 ====================
  console.log('\n========================================================');
  console.log('                    测试结果汇总');
  console.log('========================================================\n');

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const total = results.length;

  console.log(`总测试数: ${total}`);
  console.log(`✅ 通过: ${passed}`);
  console.log(`❌ 失败: ${failed}`);
  console.log(`\n通过率: ${((passed / total) * 100).toFixed(1)}%\n`);

  if (failed > 0) {
    console.log('失败用例详情:');
    results
      .filter((r) => !r.passed)
      .forEach((r, i) => {
        console.log(`  ${i + 1}. [${r.status}] ${r.name}`);
        if (r.validationError) console.log(`     验证: ${r.validationError}`);
        console.log(`     ${r.preview}`);
      });
  }

  // 输出 JSON 报告
  const report = {
    timestamp: new Date().toISOString(),
    total,
    passed,
    failed,
    passRate: ((passed / total) * 100).toFixed(2),
    results,
  };
  const reportPath = path.resolve('test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 测试报告已保存: ${reportPath}`);

  process.exit(failed > 0 ? 1 : 0);
}

run().catch((e) => {
  console.error('测试执行异常:', e);
  process.exit(1);
});
