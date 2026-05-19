export default async function handler(req, res) {
  const company = req.query.company || 'Apple';
  const apiKey = process.env.NEWS_API_KEY;

  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(company)}&sortBy=publishedAt&pageSize=5&apiKey=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
}
