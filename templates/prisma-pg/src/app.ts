import express from 'express';
import errorMiddleware from './middlewares/error.middleware';

// Import routes later, e.g.:
// import userRoutes from './routes/user.routes';

const app = express();

app.use(express.json());

// Mount routes here later
// app.use('/api/users', userRoutes);

app.use(errorMiddleware);

export default app;
