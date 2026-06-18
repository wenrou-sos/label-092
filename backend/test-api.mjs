import http from 'http';

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

async function test(name, method, path, data = null, headers = {}) {
  const res = await request(method, path, data, headers);
  const ok = res.status >= 200 && res.status < 300;
  results.push({ name, status: res.status, ok, data: res.data || res.body || res.error });
  const icon = ok ? '✅' : res.status === 0 ? '❌' : '⚠️';
  console.log(`${icon} [${res.status}] ${name}`);
  if (!ok) {
    console.log('   ', JSON.stringify(res.data || res.body || res.error).slice(0, 200));
  }
}

async function run() {
  console.log('=== 接口连通性测试 ===\n');

  await test('1. 健康检查', 'GET', '/api/health');
  await test('2. 商品列表(无鉴权)', 'GET', '/api/products?page=1&pageSize=5');
  await test('3. 品鉴会列表(无鉴权)', 'GET', '/api/tastings?page=1&pageSize=5');
  await test('4. 会员注册', 'POST', '/api/auth/register', {
    phone: '13800138000',
    name: '测试用户',
    password: '123456',
  });
  const loginRes = await request('POST', '/api/auth/login', {
    phone: '13800138000',
    password: '123456',
  });
  const memberToken = loginRes.data?.token;
  const loginOk = loginRes.status >= 200 && loginRes.status < 300;
  results.push({
    name: '5. 会员登录',
    status: loginRes.status,
    ok: loginOk,
    data: loginRes.data || loginRes.body,
  });
  console.log(`${loginOk ? '✅' : '⚠️'} [${loginRes.status}] 5. 会员登录`);

  if (memberToken) {
    await test('6. 会员个人信息', 'GET', '/api/member/profile', null, {
      Authorization: `Bearer ${memberToken}`,
    });
    await test('7. 我的订单列表', 'GET', '/api/orders/my?page=1&pageSize=5', null, {
      Authorization: `Bearer ${memberToken}`,
    });
  } else {
    console.log('⏭️  跳过会员鉴权接口（无Token）');
  }

  const adminLoginRes = await request('POST', '/api/admin/login', {
    username: 'admin',
    password: 'admin123',
  });
  const adminToken = adminLoginRes.data?.token;
  const adminOk = adminLoginRes.status >= 200 && adminLoginRes.status < 300;
  results.push({
    name: '8. 管理员登录',
    status: adminLoginRes.status,
    ok: adminOk,
    data: adminLoginRes.data || adminLoginRes.body,
  });
  console.log(`${adminOk ? '✅' : '⚠️'} [${adminLoginRes.status}] 8. 管理员登录`);

  if (adminToken) {
    await test('9. 管理员订单列表', 'GET', '/api/admin/orders?page=1&pageSize=5', null, {
      Authorization: `Bearer ${adminToken}`,
    });
    await test('10. 管理员会员列表', 'GET', '/api/admin/members?page=1&pageSize=5', null, {
      Authorization: `Bearer ${adminToken}`,
    });
  } else {
    console.log('⏭️  跳过管理员鉴权接口（无Token）');
  }

  console.log('\n=== 测试结果汇总 ===');
  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;
  console.log(`通过: ${passed} / 总: ${results.length}`);

  if (failed > 0) {
    console.log('\n失败的接口:');
    results
      .filter((r) => !r.ok)
      .forEach((r) => {
        console.log(`  - ${r.name} [${r.status}]: ${JSON.stringify(r.data).slice(0, 300)}`);
      });
  }
}

run().catch(console.error);
