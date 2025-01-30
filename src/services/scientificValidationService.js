import axios from 'axios';

// Ajusta si tienes .env
const PUBMED_EMAIL = process.env.PUBMED_EMAIL || 'test@example.com';
const NCBI_API_KEY = process.env.NCBI_API_KEY || '';

export async function validateClaim(claimText) {
  console.log('[validateClaim] Checking in PubMed ->', claimText.slice(0, 50), '...'); // log truncated text
  try {
    const query = encodeURIComponent(claimText);
    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${query}&retmax=1&tool=VerifyInfluencers&email=${PUBMED_EMAIL}${
      NCBI_API_KEY ? `&api_key=${NCBI_API_KEY}` : ''
    }`;

    const resp = await axios.get(url);
    const xmlData = resp.data;
    const match = xmlData.match(/<Count>(\d+)<\/Count>/);
    const count = match ? parseInt(match[1], 10) : 0;

    let status = 'Questionable';
    let confidence = 50;
    if (count > 0) {
      status = 'Verified';
      confidence = 90;
    } else {
      status = 'Debunked';
      confidence = 20;
    }

    return {
      text: claimText,
      status,
      confidence
    };
  } catch (err) {
    console.error('[validateClaim] PubMed error:', err.message);
    return {
      text: claimText,
      status: 'Questionable',
      confidence: 40
    };
  }
}
