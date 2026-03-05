import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import clockRoutes from './routes/clock.js';
import qrRoutes from './routes/qr.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/clock', clockRoutes);
app.use('/api/qr', qrRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', msg: 'Maritime QR Clock API' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
