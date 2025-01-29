// backend/src/services/influencerService.js
import axios from 'axios';

const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

/**
 * fetchInfluencers: Llama a la Twitter API
 */
export async function fetchInfluencers() {
  console.log('[fetchInfluencers] Entrando...');
  try {
    // Por ejemplo, consultamos 2 usernames fijos
    const usernames = ['hubermanlab', 'drpeterrl']; 
    const requests = usernames.map((uname) =>
      axios.get(`https://api.twitter.com/2/users/by/username/${uname}`, {
        headers: { Authorization: `Bearer ${TWITTER_BEARER_TOKEN}` }
      })
    );

    const responses = await Promise.all(requests);
    // Mapeamos data
    const influencers = responses.map((r) => {
      const user = r.data.data;
      return {
        id: user.id,
        name: user.name,
        username: user.username,
        score: 80,
        followers: 0
      };
    });
    console.log('[fetchInfluencers] OK. Devuelvo array de', influencers.length, 'influencers');
    return influencers;
  } catch (err) {
    console.error('[fetchInfluencers] Error:', err.message);
    // Para ver la data del response si es 401/403
    if (err.response) {
      console.error('[fetchInfluencers] ErrResponse:', err.response.status, err.response.data);
    }
    throw new Error('No se pudo obtener influencers de Twitter');
  }
}

/**
 * fetchInfluencerDetails: saca los tweets recientes
 */
export async function fetchInfluencerDetails(influencerId) {
  console.log('[fetchInfluencerDetails] id:', influencerId);
  try {
    const url = `https://api.twitter.com/2/users/${influencerId}/tweets?max_results=5&tweet.fields=created_at`;
    const resp = await axios.get(url, {
      headers: { Authorization: `Bearer ${TWITTER_BEARER_TOKEN}` }
    });
    const tweets = resp.data.data || [];
    console.log('[fetchInfluencerDetails] tweets found:', tweets.length);

    return {
      id: influencerId,
      name: 'Desconocido',
      score: 80,
      followers: 9999,
      claims: tweets.map((t) => ({
        text: t.text,
        created_at: t.created_at,
        status: 'Unknown',
        confidence: null
      }))
    };
  } catch (err) {
    console.error('[fetchInfluencerDetails] Error:', err.message);
    if (err.response) {
      console.error('[fetchInfluencerDetails] ErrResponse:', err.response.status, err.response.data);
    }
    throw new Error('No se pudo obtener detalles de Twitter');
  }
}
