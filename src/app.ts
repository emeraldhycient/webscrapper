import express from 'express';
import jobRoutes from './routes/jobRoutes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();
app.use(express.json());
app.use('/api/jobs', jobRoutes);
app.use(errorHandler);

export default app;
