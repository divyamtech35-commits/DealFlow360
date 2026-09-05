import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'DealFlow360 Backend', timestamp: new Date().toISOString() });
});

// Mount /api/v1 REST API
app.use('/api/v1', routes);

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
