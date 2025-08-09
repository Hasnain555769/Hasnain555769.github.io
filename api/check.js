// api/check.js
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Accept both POST (JSON) and GET (query)
  const params = req.method === 'POST' ? (req.body || {}) : (req.query || {});
  const type = params.type || (params?.query && params.query.type);

  try {
    // --- Synonyms endpoint (Datamuse) ---
    if (type === 'synonyms' || params.word) {
      const word = params.word || params.q || '';
      const resp = await fetch(`https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word)}&max=20`);
      const data = await resp.json();
      return res.status(200).json(data);
    }

    // --- Grammar check (LanguageTool) ---
    const text = params.text || '';
    const language = params.language || 'en-US';
    const body = new URLSearchParams({ text, language }).toString();

    const ltResp = await fetch('https://api.languagetool.org/v2/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    });

    const data = await ltResp.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
