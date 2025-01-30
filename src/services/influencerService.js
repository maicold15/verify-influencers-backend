import axios from 'axios';

// Simulamos 3 "influencers" con su id, wikiTitle, etc.
let mockInfluencers = [
  { id: '1', wikiTitle: 'Andrew_Huberman', name: 'Andrew Huberman', score: 88, followers: 4200000 },
  { id: '2', wikiTitle: 'Peter_Attia', name: 'Peter Attia', score: 94, followers: 1200000 },
  { id: '3', wikiTitle: 'Rhonda_Patrick', name: 'Rhonda Patrick', score: 90, followers: 980000 },
];

/**
 * GET /api/influencers
 * Retorna lista simple para Leaderboard
 */
export async function fetchInfluencers() {
  // Podemos devolver data local sin llamar a Wikipedia
  return mockInfluencers.map(inf => ({
    id: inf.id,
    name: inf.name,
    score: inf.score,
    followers: inf.followers
  }));
}

/**
 * GET /api/influencers/:id
 * Llama a Wikipedia para extraer un "summary" y lo retorna
 */
export async function fetchInfluencerDetails(id) {
  const inf = mockInfluencers.find((x) => x.id === id);
  if (!inf) throw new Error('Influencer not found');

  const url = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&format=json&titles=${inf.wikiTitle}`;
  try {
    const resp = await axios.get(url);
    const pages = resp.data.query.pages;
    const pageId = Object.keys(pages)[0];
    const summary = pages[pageId].extract || '(No summary found)';

    return {
      id: inf.id,
      name: inf.name,
      score: inf.score,
      followers: inf.followers,
      summary,
      claims: []
    };
  } catch (err) {
    console.error('[fetchInfluencerDetails] Wikipedia Error:', err.message);
    throw new Error('No se pudo obtener datos de Wikipedia');
  }
}
