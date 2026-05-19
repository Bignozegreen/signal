export default async function handler(req, res) {
  const company = req.query.company || 'Apple';
  const apiKey = process.env.Guardian;

  const url = `https://content.guardianapis.com/search?q=${encodeURIComponent(company)}&api-key=${apiKey}&show-fields=headline,trailText,byline&order-by=newest&page-size=5`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.response && data.response.results) {
      const articles = data.response.results.map(function (item) {
        return {
          title: item.webTitle,
          description: item.fields ? item.fields.trailText : '',
          url: item.webUrl,
          publishedAt: item.webPublicationDate,
          source: { name: 'The Guardian' }
        };
      });
      res.setHeader('Cache-Control', 'no-store');
      res.status(200).json({ status: 'ok', articles });
    } else {
      res.status(200).json({ status: 'ok', articles: [] });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
}
