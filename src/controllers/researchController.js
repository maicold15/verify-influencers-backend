// backend/src/controllers/researchController.js
import { analyzeInfluencerContent } from '../services/aiService.js';

export async function runResearch(req, res) {
  console.log('[runResearch] body:', req.body);
  const { influencerName, dateRange, claimLimit } = req.body;
  try {
    const result = await analyzeInfluencerContent(
      influencerName,
      dateRange,
      claimLimit || 5
    );
    res.json(result);
  } catch (err) {
    console.error('[runResearch] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
