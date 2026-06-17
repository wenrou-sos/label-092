import 'reflect-metadata';
import { DataSource } from 'typeorm';
import path from 'path';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'tea_platform',
  synchronize: false,
  logging: true,
  entities: [path.join(__dirname, '/entities/**/*.{ts,js}')],
  migrations: [path.join(__dirname, '/migrations/**/*.{ts,js}')],
  subscribers: [],
});
