import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'my_api',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || '',
  logging: false,
});

export default sequelize;
