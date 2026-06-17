<template>
  <footer class="footer">
    <div class="container footer-inner">
      <div class="footer-section">
        <h3 class="footer-title">关于茗韵轩</h3>
        <p class="footer-text">
          茗韵轩传承百年制茶工艺，严选六大茶类优质茶叶，
          从茶园到茶杯，为您呈现最纯正的茶香体验。
        </p>
      </div>
      <div class="footer-section">
        <h3 class="footer-title">茶类导航</h3>
        <ul class="footer-links">
          <li><router-link to="/products?category=green">绿茶</router-link></li>
          <li><router-link to="/products?category=black">红茶</router-link></li>
          <li><router-link to="/products?category=oolong">乌龙茶</router-link></li>
          <li><router-link to="/products?category=white">白茶</router-link></li>
          <li><router-link to="/products?category=dark">黑茶</router-link></li>
          <li><router-link to="/products?category=yellow">黄茶</router-link></li>
        </ul>
      </div>
      <div class="footer-section">
        <h3 class="footer-title">会员服务</h3>
        <ul class="footer-links">
          <li><router-link to="/member">会员中心</router-link></li>
          <li><router-link to="/tastings">品鉴会预约</router-link></li>
          <li><a href="#">会员等级</a></li>
          <li><a href="#">积分商城</a></li>
        </ul>
      </div>
      <div class="footer-section">
        <h3 class="footer-title">联系我们</h3>
        <p class="footer-text">客服热线：400-888-8888</p>
        <p class="footer-text">工作时间：9:00 - 21:00</p>
        <p class="footer-text">邮箱：service@mingyunxuan.com</p>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2024 茗韵轩 版权所有 | 京ICP备12345678号</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
</script>

<style scoped>
.footer {
  background: #2d2d2d;
  color: #aaa;
  margin-top: 60px;
}

.footer-inner {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 40px;
  padding: 40px 20px;
}

.footer-title {
  color: #fff;
  font-size: 16px;
  margin-bottom: 20px;
}

.footer-text {
  line-height: 1.8;
  font-size: 14px;
}

.footer-links {
  list-style: none;
}

.footer-links li {
  margin-bottom: 10px;
}

.footer-links a {
  color: #aaa;
  font-size: 14px;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: #c9a227;
}

.footer-bottom {
  text-align: center;
  padding: 20px;
  border-top: 1px solid #444;
  font-size: 13px;
}
</style>
