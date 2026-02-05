import app from './app';
import prisma from './config/prisma';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

prisma
  .$connect()
  .then(() => {
    console.log('Prisma connected to MySQL');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err:any) => {
    console.error('Prisma connection failed:', err);
    process.exit(1);
  });
