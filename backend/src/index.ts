import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { AppDataSource } from './db/data-source';
import routes from './routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api', routes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '茶叶新零售平台API服务正常' });
});

AppDataSource.initialize()
  .then(() => {
    console.log('数据库连接成功');
    app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
      console.log(`API文档: http://localhost:${PORT}/api/health`);
      console.log(`静态资源: http://localhost:${PORT}/uploads`);
    });
  })
  .catch((error) => {
    console.error('数据库连接失败:', error);
    process.exit(1);
  });
