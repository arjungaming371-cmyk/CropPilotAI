import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import farmRoutes from './routes/farmRoutes.js';
import advisoryRoutes from './routes/advisoryRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Security & Logging Middlewares
app.use(helmet());
app.use(morgan('dev'));

// CORS configuration supporting local dev and Vercel production frontend
const allowedOrigins = [
  CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive for initial testing and seamless multi-device preview
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'CropPilotAI Backend API',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    supabaseConfigured: !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
    timestamp: new Date().toISOString()
  });
});

// Primary Routes
app.use('/api/farms', farmRoutes);
app.use('/api/advisories', advisoryRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.url}` });
});

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🌾 CropPilotAI Backend API running on port ${PORT}`);
  console.log(`🌐 Local endpoint: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Allowed Client: ${CLIENT_URL}`);
  console.log(`===============================================`);
});
