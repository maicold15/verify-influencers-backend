import { Router } from 'express';
import {
  getAllInfluencers,
  getInfluencerById
} from '../controllers/influencerController.js';

const router = Router();

// GET /api/influencers
router.get('/', getAllInfluencers);

// GET /api/influencers/:id
router.get('/:id', getInfluencerById);

export default router;
