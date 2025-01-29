// backend/src/services/aiService.js
import 'dotenv/config';
import OpenAI from 'openai';
import { validateClaim } from './scientificValidationService.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function analyzeInfluencerContent(influencerName, dateRange, claimLimit) {
  console.log('[analyzeInfluencerContent]', influencerName, dateRange, claimLimit);

  // 1. Supongamos que extraemos mockTweets
  const mockTweets = [
    'El té verde es beneficioso para la salud cardiovascular.',
    'El azúcar causa hiperactividad en niños.',
    'Comer una manzana al día previene enfermedades cardíacas.',
    'El azúcar causa hiperactividad en niños.'
  ];

  const prompt = `
    Dado los siguientes textos de un influencer, analiza las posibles "afirmaciones de salud" y devuélvelas en formato JSON.
    Ejemplo:
    [
      { "claim": "texto", "category": "Nutrition/Mental/etc." }
    ]
    No incluyas más explicación, solo JSON válido.

    Textos:
    ${mockTweets.join('\n')}
  `;

  try {
    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Devuelve SOLO JSON puro, sin explicación.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    });

    const content = chatResponse.choices[0].message.content;
    console.log('[analyzeInfluencerContent] GPT content:', content);

    let rawClaims = [];
    try {
      rawClaims = JSON.parse(content);
    } catch (error) {
      console.error('[analyzeInfluencerContent] JSON parse error:', error);
      rawClaims = mockTweets.map((t) => ({ claim: t, category: 'Unknown' }));
    }

    // Eliminar duplicados
    const uniqueMap = new Map();
    rawClaims.forEach((c) => uniqueMap.set(c.claim, c));
    const uniqueClaims = Array.from(uniqueMap.values()).slice(0, claimLimit);

    // Validar con PubMed
    const results = [];
    for (const item of uniqueClaims) {
      const validated = await validateClaim(item.claim);
      results.push({
        ...validated,
        category: item.category
      });
    }

    console.log('[analyzeInfluencerContent] results:', results.length, 'claims validated');
    return {
      influencerName,
      dateRange,
      claimsAnalyzed: results
    };
  } catch (err) {
    console.error('[analyzeInfluencerContent] Error en OpenAI:', err.message);
    if (err.response) {
      console.error('[analyzeInfluencerContent] Status:', err.response.status, err.response.data);
    }
    throw new Error('Fallo la llamada a OpenAI');
  }
}
