export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { articles, company } = req.body;
  if (!articles || articles.length === 0) {
    return res.status(400).json({ error: 'No articles provided' });
  }

  const groqKey = process.env.GROQ_API_KEY;

  const articleText = articles
    .map((a, i) => `Article ${i + 1}: "${a.title}". ${a.description || ''}`)
    .join('\n');

  const prompt = `You are a financial narrative intelligence analyst. Analyse these recent news articles about ${company} and return a JSON object with exactly this structure:
{
  "sentiment": "Positive" | "Neutral" | "Cautious" | "Negative",
  "score": number between 0-100,
  "score_change": "e.g. +8 from last week" or "-5 from last week",
  "tone_shift": "one word like Confident, Cautious, Optimistic, Fearful, Neutral",
  "tone_shift_previous": "e.g. Was: Optimistic · recently",
  "community_sentiment": "one word like Excited, Anxious, Neutral, Bullish, Bearish",
  "community_sentiment_change": "e.g. Shifted recently or Stable",
  "summary": "2-3 sentence plain English summary of the narrative",
  "key_signals": ["signal 1", "signal 2", "signal 3"],
  "tone_words": ["word1", "word2", "word3", "word4"],
  "alerts": [
    {"level": "high" | "medium" | "low", "title": "short alert title", "detail": "one sentence detail"}
  ],
  "language_trends": [
    {"word": "keyword", "direction": "rising" | "falling" | "stable", "change": "e.g. +120% increase"}
  ]
}

Include 2-3 alerts and 4-6 language_trends based on the articles. Return only valid JSON, no other text.

Articles to analyse:
${articleText}`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1200
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON in response');
    const analysis = JSON.parse(match[0]);
    res.status(200).json(analysis);
  } catch (err) {
    res.status(500).json({ error: 'Analysis failed' });
  }
}
