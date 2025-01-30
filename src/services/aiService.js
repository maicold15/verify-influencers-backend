import axios from 'axios';
import { validateClaim } from './scientificValidationService.js';

/**
 * Extrae un summary (las primeras ~300 chars) y el resto (snippet) del texto Wikipedia
 * Luego cada oración se pasa a PubMed para "validar".
 */
export async function analyzeInfluencerContent(influencerName, dateRange, claimLimit) {
  console.log('[analyzeInfluencerContent] Calling Wikipedia for:', influencerName);

  // (1) Llamada a la Wikipedia API para texto completo
  const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&format=json&titles=${influencerName}`;
  let wikiText = '';
  try {
    const resp = await axios.get(wikiUrl);
    const pages = resp.data.query.pages;
    const pageId = Object.keys(pages)[0];
    wikiText = pages[pageId].extract || '';
  } catch (err) {
    console.error('[analyzeInfluencerContent] Wikipedia error:', err.message);
    throw new Error('Fallo la llamada a Wikipedia');
  }

  if (!wikiText) {
    // Si no hay texto, retornamos
    return {
      influencerName,
      dateRange,
      wikiSummary: '(No Wikipedia summary found)',
      wikiSnippet: '',
      claimsAnalyzed: []
    };
  }

  // (2) Summary: tomamos las primeras 300 caracteres (o hasta el primer salto de línea)
  // Esto simula "intro" del artículo
  let wikiSummary = wikiText.slice(0, 300);
  // Cortar en salto de línea si existe
  const firstLineBreak = wikiSummary.indexOf('\n');
  if (firstLineBreak !== -1) {
    wikiSummary = wikiSummary.slice(0, firstLineBreak);
  }

  // (3) "Snippet" (texto completo) para generar "claims"
  //  - Podrías usar substring(0, 2000) si el artículo es muy largo
  const wikiSnippet = wikiText;

  // (4) Partir en oraciones para "claims" (removemos filtros agresivos)
  let sentences = wikiSnippet.split(/\.\s+/);
  // Eliminamos oraciones super vacías
  sentences = sentences.map(s => s.trim()).filter(s => s.length > 3);

  // Limit a claimLimit
  const rawClaims = sentences.slice(0, claimLimit);

  // (5) Validar en PubMed
  const results = [];
  for (const sentence of rawClaims) {
    const validated = await validateClaim(sentence);
    // Indicar que viene de Wikipedia + PubMed
    results.push({
      ...validated,
      source: 'Wikipedia + PubMed'
    });
  }

  console.log(`[analyzeInfluencerContent] Found ${results.length} claims from Wikipedia text.`);

  // (6) Retornamos summary + snippet + claims
  return {
    influencerName,
    dateRange,
    wikiSummary,
    wikiSnippet,
    claimsAnalyzed: results
  };
}
