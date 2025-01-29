import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import influencersRoutes from './routes/influencers.js';
import researchRoutes from './routes/research.js';

dotenv.config(); // Carga variables de entorno de .env

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/influencers', influencersRoutes);
app.use('/api/research', researchRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
