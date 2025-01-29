import { Router } from 'express';
import { runResearch } from '../controllers/researchController.js';

const router = Router();

// POST /api/research
router.post('/', runResearch);

export default router;
