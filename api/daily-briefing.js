export default async function handler(req, res) {
  const topics = ['Apple', 'Microsoft', 'Nvidia', 'Tesla', 'Amazon', 'Google', 'Meta', 'Netflix', 'AMD', 'Palantir', 'Bitcoin', 'Ethereum', 'Solana', 'XRP', 'Dogecoin', 'HSBC', 'Barclays', 'BP', 'AstraZeneca', 'Rolls-Royce', 'Federal Reserve', 'Inflation', 'Recession', 'Interest Rates', 'Artificial Intelligence', 'Electric Vehicles', 'Defence', 'Oil', 'Gold', 'OpenAI'];
  const guardianKey = process.env.Guardian;
  const groqKey = process.env.GROQ_API_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY;

  const briefings = [];

  for (const topic of topics) {
    try {
      const newsUrl = `https://content.guardianapis.com/search?q=${encodeURIComponent(topic)}&api-key=${guardianKey}&show-fields=trailText&order-by=newest&page-size=3&section=business|technology|money`;
      const newsRes = await fetch(newsUrl);
      const newsData = await newsRes.json();

      if (!newsData.response || !newsData.response.results.length) continue;

      const articles = newsData.response.results.map(a => ({
        title: a.webTitle,
        description: a.fields?.trailText || ''
      }));

      const prompt = `Analyse these news articles about ${topic} and return JSON: {"sentiment": "Positive|Neutral|Cautious|Negative", "score": 0-100, "summary": "one sentence"}. Articles: ${articles.map(a => a.title).join('. ')}. Return only JSON.`;

      const aiRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${groqKey}` },
        body: JSON.stringify({ model: 'llama-3.1-8b-instant', messages: [{ role: 'user', content: prompt }], temperature: 0.3, max_tokens: 150 })
      });

      const aiData = await aiRes.json();
      const analysis = JSON.parse(aiData.choices[0].message.content);

      briefings.push({ topic, ...analysis });
    } catch (err) {
      briefings.push({ topic, sentiment: 'Unknown', score: 0, summary: 'Analysis unavailable.' });
    }
  }

  const sentimentColor = { Positive: '#4ade80', Neutral: '#8888aa', Cautious: '#facc15', Negative: '#f87171' };

  const emailHtml = `
    <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0f; color: #e8e8f0; padding: 2rem; border-radius: 12px;">
      <h1 style="color: #7c6aff; font-size: 1.4rem; margin-bottom: 0.25rem;">Signal</h1>
      <p style="color: #8888aa; font-size: 0.85rem; margin-bottom: 2rem;">Daily Narrative Briefing — ${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      ${briefings.map(b => `
        <div style="background: #12121e; border: 1px solid #1e1e2e; border-radius: 10px; padding: 1.25rem; margin-bottom: 1rem; border-left: 3px solid ${sentimentColor[b.sentiment] || '#8888aa'};">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <strong style="color: #ffffff;">${b.topic}</strong>
            <span style="color: ${sentimentColor[b.sentiment] || '#8888aa'}; font-size: 0.85rem;">${b.sentiment} · ${b.score}/100</span>
          </div>
          <p style="color: #aaaacc; font-size: 0.9rem; margin: 0;">${b.summary}</p>
        </div>
      `).join('')}
      <p style="color: #44445a; font-size: 0.8rem; margin-top: 2rem; text-align: center;">Signal · Built for investors who read between the lines</p>
    </div>
  `;

  const usersRes = await fetch(`${supabaseUrl}/rest/v1/waitlist?select=email`, {
    headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
  });
  const users = await usersRes.json();

  let sent = 0;
  for (const user of users) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendKey}` },
        body: JSON.stringify({
          from: 'Signal <onboarding@resend.dev>',
          to: user.email,
          subject: `Signal Briefing — ${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}`,
          html: emailHtml
        })
      });
      sent++;
    } catch (err) {}
  }

  res.status(200).json({ success: true, briefings: briefings.length, emails_sent: sent });
}
