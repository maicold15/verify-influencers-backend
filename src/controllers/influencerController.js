import { fetchInfluencers, fetchInfluencerDetails } from '../services/influencerService.js';

export async function getAllInfluencers(req, res) {
  try {
    const infs = await fetchInfluencers();
    res.json(infs);
  } catch (err) {
    console.error('[getAllInfluencers] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

export async function getInfluencerById(req, res) {
  try {
    const { id } = req.params;
    const inf = await fetchInfluencerDetails(id);
    res.json(inf);
  } catch (err) {
    console.error('[getInfluencerById] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
